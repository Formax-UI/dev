#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const requiredFiles = [
  'index.js',
  'index.mjs',
  'index.d.ts',
  'ai.js',
  'ai.mjs',
  'ai.d.ts',
  'cli.js',
  'workflow.js',
  'workflow.mjs',
  'workflow.d.ts',
  'legacy.js',
  'legacy.mjs',
  'legacy.d.ts',
  'templates.js',
  'templates.mjs',
  'templates.d.ts',
  'intelligence.js',
  'intelligence.mjs',
  'intelligence.d.ts',
  'styles.css',
  'legacy.css',
];
const sizeBudgets = {
  'ai.js': 20_000,
  'ai.mjs': 20_000,
  'index.js': 85_000,
  'index.mjs': 85_000,
  'intelligence.js': 8_000,
  'intelligence.mjs': 8_000,
  'legacy.js': 40_000,
  'legacy.mjs': 40_000,
  'styles.css': 40_000,
  'templates.js': 45_000,
  'templates.mjs': 45_000,
  'workflow.js': 45_000,
  'workflow.mjs': 45_000,
};

for (const file of requiredFiles) {
  const absolute = path.join(dist, file);

  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing package artifact: dist/${file}`);
  }

  const budget = sizeBudgets[file];

  if (budget && fs.statSync(absolute).size > budget) {
    throw new Error(`Package artifact dist/${file} exceeds the ${budget} byte size budget.`);
  }
}

const cjs = require(path.join(dist, 'index.js'));
const ai = require(path.join(dist, 'ai.js'));
const intelligence = require(path.join(dist, 'intelligence.js'));
const legacy = require(path.join(dist, 'legacy.js'));
const templates = require(path.join(dist, 'templates.js'));
const workflow = require(path.join(dist, 'workflow.js'));
const cliSource = fs.readFileSync(path.join(dist, 'cli.js'), 'utf8');

if (typeof cjs.Form !== 'function' || typeof cjs.SchemaForm !== 'function') {
  throw new Error('CommonJS entry does not expose the v2 workflow API.');
}

if (typeof workflow.Form !== 'function' || typeof workflow.SchemaForm !== 'function' || workflow.TextInput) {
  throw new Error('Workflow entry does not expose a clean v2 workflow API.');
}

if (!legacy.TextInput || !legacy.SubmitButton) {
  throw new Error('Legacy entry does not expose the legacy aliases.');
}

if (
  typeof ai.createDeepSeekFormAssistant !== 'function' ||
  typeof ai.createFormAssistant !== 'function' ||
  typeof ai.validateFormConfig !== 'function'
) {
  throw new Error('AI subpath does not expose the expected provider API.');
}

if (typeof templates.signupTemplate !== 'object' || typeof templates.checkoutTemplate !== 'object') {
  throw new Error('Templates subpath does not expose production templates.');
}

if (typeof intelligence.useFormAutosave !== 'function' || typeof intelligence.useFormAnalytics !== 'function') {
  throw new Error('Intelligence subpath does not expose form intelligence hooks.');
}

const workflowSource = fs.readFileSync(path.join(dist, 'workflow.mjs'), 'utf8');

if (workflowSource.includes('react-datepicker') || workflowSource.includes('DatePicker')) {
  throw new Error('Workflow entry includes legacy DatePicker code.');
}

if (!cliSource.startsWith('#!/usr/bin/env node')) {
  throw new Error('CLI entry is missing a Node shebang.');
}

Promise.all([
  import(path.join(dist, 'index.mjs')),
  import(path.join(dist, 'ai.mjs')),
  import(path.join(dist, 'workflow.mjs')),
  import(path.join(dist, 'legacy.mjs')),
  import(path.join(dist, 'templates.mjs')),
  import(path.join(dist, 'intelligence.mjs')),
]).then(([esm, aiEsm, workflowEsm, legacyEsm, templatesEsm, intelligenceEsm]) => {
  if (
    typeof esm.Form !== 'function' ||
    typeof aiEsm.createDeepSeekFormAssistant !== 'function' ||
    typeof workflowEsm.SchemaForm !== 'function' ||
    !legacyEsm.TextInput ||
    typeof templatesEsm.signupTemplate !== 'object' ||
    typeof intelligenceEsm.useFormAutosave !== 'function'
  ) {
    throw new Error('ESM entries do not expose the expected API.');
  }

  console.log('Package artifacts verified.');
});

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
  'studio-core.js',
  'studio-core.mjs',
  'studio-core.d.ts',
  'adapters.js',
  'adapters.mjs',
  'adapters.d.ts',
  'styles.css',
  'legacy.css',
];
const sizeBudgets = {
  'adapters.js': 8_000,
  'adapters.mjs': 8_000,
  'ai.js': 35_000,
  'ai.mjs': 35_000,
  'index.js': 85_000,
  'index.mjs': 85_000,
  'intelligence.js': 8_000,
  'intelligence.mjs': 8_000,
  'legacy.js': 40_000,
  'legacy.mjs': 40_000,
  'studio-core.js': 35_000,
  'studio-core.mjs': 35_000,
  'styles.css': 40_000,
  'templates.js': 60_000,
  'templates.mjs': 60_000,
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
const studioCore = require(path.join(dist, 'studio-core.js'));
const adapters = require(path.join(dist, 'adapters.js'));
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

if (
  typeof studioCore.validateFormaxWorkflow !== 'function' ||
  typeof studioCore.generateReactFormCode !== 'function' ||
  typeof studioCore.diffWorkflowConfigs !== 'function'
) {
  throw new Error('Studio core subpath does not expose workflow validation and export helpers.');
}

if (
  typeof adapters.createFormaxAdapter !== 'function' ||
  adapters.shadcnAdapter?.name !== 'shadcn' ||
  adapters.muiAdapter?.name !== 'mui'
) {
  throw new Error('Adapters subpath does not expose adapter metadata helpers.');
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
  import(path.join(dist, 'studio-core.mjs')),
  import(path.join(dist, 'adapters.mjs')),
]).then(([esm, aiEsm, workflowEsm, legacyEsm, templatesEsm, intelligenceEsm, studioCoreEsm, adaptersEsm]) => {
  if (
    typeof esm.Form !== 'function' ||
    typeof aiEsm.createDeepSeekFormAssistant !== 'function' ||
    typeof workflowEsm.SchemaForm !== 'function' ||
    !legacyEsm.TextInput ||
    typeof templatesEsm.signupTemplate !== 'object' ||
    typeof intelligenceEsm.useFormAutosave !== 'function' ||
    typeof studioCoreEsm.validateFormaxWorkflow !== 'function' ||
    adaptersEsm.shadcnAdapter?.name !== 'shadcn'
  ) {
    throw new Error('ESM entries do not expose the expected API.');
  }

  console.log('Package artifacts verified.');
});

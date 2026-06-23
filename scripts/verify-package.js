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
  'styles.css',
];

for (const file of requiredFiles) {
  const absolute = path.join(dist, file);

  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing package artifact: dist/${file}`);
  }
}

const cjs = require(path.join(dist, 'index.js'));
const ai = require(path.join(dist, 'ai.js'));

if (typeof cjs.Form !== 'function' || typeof cjs.SchemaForm !== 'function') {
  throw new Error('CommonJS entry does not expose the v2 workflow API.');
}

if (typeof ai.createDeepSeekFormAssistant !== 'function') {
  throw new Error('AI subpath does not expose createDeepSeekFormAssistant.');
}

Promise.all([
  import(path.join(dist, 'index.mjs')),
  import(path.join(dist, 'ai.mjs')),
]).then(([esm, aiEsm]) => {
  if (typeof esm.Form !== 'function' || typeof aiEsm.createDeepSeekFormAssistant !== 'function') {
    throw new Error('ESM entries do not expose the expected API.');
  }

  console.log('Package artifacts verified.');
});

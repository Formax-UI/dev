#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowDir = path.join(root, 'src', 'workflow');
const outputFile = path.join(root, 'docs', 'API.md');

const files = ['Form.tsx', 'fields.tsx', 'schema.tsx'];
const exportPattern = /export\s+(?:function|type)\s+([A-Za-z0-9_]+)/g;

const exportsByFile = files.map((file) => {
  const source = fs.readFileSync(path.join(workflowDir, file), 'utf8');
  const names = [];
  let match = exportPattern.exec(source);

  while (match) {
    names.push(match[1]);
    match = exportPattern.exec(source);
  }

  return { file, names };
});

const content = [
  '# Formax UI API',
  '',
  'Generated from the v2 workflow source. Run `npm run docs:api` after public API changes.',
  '',
  ...exportsByFile.flatMap(({ file, names }) => [
    `## ${file.replace(/\.tsx$/, '')}`,
    '',
    ...names.map((name) => `- \`${name}\``),
    '',
  ]),
].join('\n');

fs.writeFileSync(outputFile, content);
console.log(`Wrote ${path.relative(root, outputFile)}`);

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputFile = path.join(root, 'docs', 'API.md');

const files = [
  { file: 'src/workflow/Form.tsx', title: 'Form' },
  { file: 'src/workflow/fields.tsx', title: 'fields' },
  { file: 'src/workflow/schema.tsx', title: 'schema' },
  { file: 'src/ai.ts', title: 'ai' },
  { file: 'src/templates.tsx', title: 'templates' },
  { file: 'src/intelligence.ts', title: 'intelligence' },
];
const exportPattern = /export\s+(?:function|type|const)\s+([A-Za-z0-9_]+)/g;

const exportsByFile = files.map((file) => {
  const source = fs.readFileSync(path.join(root, file.file), 'utf8');
  const names = [];
  let match = exportPattern.exec(source);

  while (match) {
    names.push(match[1]);
    match = exportPattern.exec(source);
  }

  return { title: file.title, names };
});

const content = [
  '# Formax UI API',
  '',
  'Generated from the v2 workflow source. Run `npm run docs:api` after public API changes.',
  '',
  ...exportsByFile.flatMap(({ title, names }) => [
    `## ${title}`,
    '',
    ...names.map((name) => `- \`${name}\``),
    '',
  ]),
].join('\n');

fs.writeFileSync(outputFile, content);
console.log(`Wrote ${path.relative(root, outputFile)}`);

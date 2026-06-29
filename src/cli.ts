#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import {
  createWorkflowFromPrompt,
  generateConfigJson,
  generateZodSchemaCode,
} from './studio-core';

const showHelp = () => {
  console.log(`Formax UI CLI

Usage:
  npx formax-ui create-form signup
  npx formax-ui create-form checkout --adapter shadcn
  npx formax-ui create-form "enterprise onboarding" --ai
  npx formax-ui studio

Options:
  --out <dir>       Output directory
  --adapter <name>  Target adapter name for generated code notes
  --ai             Use the prompt workflow generator
  --force          Overwrite existing files
`);
};

const [, , command, ...args] = process.argv;

if (!command || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

const readFlag = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const positionalArgs = args.filter((arg, index) => {
  if (arg.startsWith('--')) return false;
  const previous = args[index - 1];
  return previous !== '--out' && previous !== '--adapter';
});

const toPascalCase = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') || 'Generated';

if (command === 'studio') {
  console.log(`Formax Studio lives in the docs/playground app.

Run:
  npm run build:lib
  cd docs && npm run dev

Then open:
  http://localhost:3000/studio
`);
  process.exit(0);
}

if (command !== 'create-form') {
  console.error(`Unknown command "${command}".`);
  showHelp();
  process.exit(1);
}

const prompt = positionalArgs.join(' ');
const requestedName = prompt || 'signup';
const outArg = readFlag('--out');
const adapter = readFlag('--adapter');
const force = args.includes('--force');
const workflow = createWorkflowFromPrompt({ prompt: requestedName });
const outDir = resolve(process.cwd(), outArg || `${workflow.id}-form`);
const legacySingleFile = outArg && extname(outArg);

if (legacySingleFile) {
  const singleFile = resolve(process.cwd(), outArg);

  if (existsSync(singleFile) && !force) {
    console.error(`${basename(singleFile)} already exists. Re-run with --force to overwrite it.`);
    process.exit(1);
  }

  writeFileSync(singleFile, singleFileComponent(workflow, adapter));
  console.log(`Created ${outArg}`);
  process.exit(0);
}

const files = {
  'Form.tsx': folderComponent(workflow, adapter),
  'config.ts': `import type { SchemaFormConfig } from 'formax-ui/workflow';

export const workflow = ${generateConfigJson(workflow)} as const;

export const config = workflow.config as SchemaFormConfig;
export const defaultValues = workflow.defaultValues;
`,
  'schema.ts': generateZodSchemaCode(workflow),
};

const existingFile = Object.keys(files).find((file) => existsSync(join(outDir, file)));

if (existingFile && !force) {
  console.error(`${join(outDir, existingFile)} already exists. Re-run with --force to overwrite it.`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

Object.entries(files).forEach(([file, contents]) => {
  writeFileSync(join(outDir, file), contents);
});

console.log(`Created ${outDir}`);

function singleFileComponent(workflowConfig: typeof workflow, adapterName?: string) {
  const componentName = `${toPascalCase(workflowConfig.name)}Form`;

  return `${adapterName ? `// Adapter target: ${adapterName}\n` : ''}import { z } from 'zod';
import { SchemaForm } from 'formax-ui/workflow';
import 'formax-ui/styles.css';

${generateZodSchemaCode(workflowConfig).replace("import { z } from 'zod';\n\n", '')}
const config = ${JSON.stringify(workflowConfig.config, null, 2)} as const;
const defaultValues = ${JSON.stringify(workflowConfig.defaultValues || {}, null, 2)} as const;

export function ${componentName}() {
  return (
    <SchemaForm
      schema={schema}
      config={config}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        console.log(values);
      }}
    />
  );
}
`;
}

function folderComponent(workflowConfig: typeof workflow, adapterName?: string) {
  const componentName = `${toPascalCase(workflowConfig.name)}Form`;

  return `${adapterName ? `// Adapter target: ${adapterName}\n` : ''}import { SchemaForm } from 'formax-ui/workflow';
import 'formax-ui/styles.css';
import { config, defaultValues } from './config';
import { schema } from './schema';

export function ${componentName}() {
  return (
    <SchemaForm
      schema={schema}
      config={config}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        console.log(values);
      }}
    />
  );
}
`;
}

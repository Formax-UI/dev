#!/usr/bin/env node

import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const templates: Record<string, string> = {
  checkout: `import { SchemaForm } from 'formax-ui/workflow';
import { checkoutTemplate } from 'formax-ui/templates';
import 'formax-ui/styles.css';

export function CheckoutForm() {
  return (
    <SchemaForm
      schema={checkoutTemplate.schema}
      defaultValues={checkoutTemplate.defaultValues}
      config={checkoutTemplate.config}
      onSubmit={async (values) => console.log(values)}
    />
  );
}
`,
  signup: `import { SchemaForm } from 'formax-ui/workflow';
import { signupTemplate } from 'formax-ui/templates';
import 'formax-ui/styles.css';

export function SignupForm() {
  return (
    <SchemaForm
      schema={signupTemplate.schema}
      defaultValues={signupTemplate.defaultValues}
      config={signupTemplate.config}
      onSubmit={async (values) => console.log(values)}
    />
  );
}
`,
};

const showHelp = () => {
  console.log(`Formax UI CLI

Usage:
  npx formax-ui create-form signup
  npx formax-ui create-form checkout

Options:
  --out <file>  Output file path
  --force       Overwrite an existing file
`);
};

const [, , command, templateName, ...flags] = process.argv;

if (!command || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (command !== 'create-form') {
  console.error(`Unknown command "${command}".`);
  showHelp();
  process.exit(1);
}

const template = templates[templateName];

if (!template) {
  console.error(`Unknown template "${templateName || ''}". Available templates: ${Object.keys(templates).join(', ')}.`);
  process.exit(1);
}

const outFlagIndex = flags.indexOf('--out');
const outFile = outFlagIndex >= 0 ? flags[outFlagIndex + 1] : `${templateName}-form.tsx`;
const force = flags.includes('--force');
const outputPath = resolve(process.cwd(), outFile);

if (existsSync(outputPath) && !force) {
  console.error(`${outFile} already exists. Re-run with --force to overwrite it.`);
  process.exit(1);
}

writeFileSync(outputPath, template);
console.log(`Created ${outFile}`);

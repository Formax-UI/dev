# Formax UI

Production-ready React form workflows for React Hook Form, Zod, and modern dashboards.

[![npm version](https://img.shields.io/npm/v/formax-ui.svg)](https://www.npmjs.com/package/formax-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why Formax UI v2

Most UI libraries give you inputs. Formax UI v2 gives you the form workflow around them: typed validation, accessible fields, schema-driven rendering, multi-step flows, error summaries, and optional AI-assisted form configuration.

## Install

```bash
npm install formax-ui react react-dom react-hook-form @hookform/resolvers zod
```

Import the package stylesheet once:

```tsx
import 'formax-ui/styles.css';
```

## Quick Start

```tsx
import { Form, FormActions, PasswordField, TextField } from 'formax-ui';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function SignupForm() {
  return (
    <Form
      schema={schema}
      defaultValues={{ email: '', password: '' }}
      onSubmit={async (values) => {
        console.log(values);
      }}
    >
      <TextField name="email" label="Email" placeholder="team@example.com" />
      <PasswordField name="password" label="Password" />
      <FormActions submitLabel="Create account" />
    </Form>
  );
}
```

## Schema-Driven Forms

```tsx
import { SchemaForm } from 'formax-ui';
import { z } from 'zod';

const checkoutSchema = z.object({
  email: z.string().email(),
  plan: z.enum(['starter', 'pro', 'enterprise']),
  newsletter: z.boolean().optional(),
});

export function CheckoutForm() {
  return (
    <SchemaForm
      schema={checkoutSchema}
      defaultValues={{ email: '', plan: '', newsletter: false }}
      config={{
        layout: 'two-column',
        submitLabel: 'Continue',
        fields: {
          plan: {
            label: 'Plan',
            placeholder: 'Choose a plan',
          },
        },
      }}
      onSubmit={async (values) => {
        console.log(values);
      }}
    />
  );
}
```

## Optional DeepSeek AI Helper

The AI helper is exported from a separate subpath and is designed for server-side use only.

```ts
import { createDeepSeekFormAssistant } from 'formax-ui/ai';

const assistant = createDeepSeekFormAssistant({
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const config = await assistant.generateConfig({
    prompt,
    audience: 'SaaS onboarding teams',
  });

  return Response.json(config);
}
```

Never expose a DeepSeek API key in browser code.

## Core API

- `Form`
- `Field`
- `FieldError`
- `ErrorSummary`
- `FormSection`
- `FormActions`
- `StepperForm`
- `useFormaxForm`
- `useFormField`
- `SchemaForm`
- `createFormConfigFromZod`

## Field Components

- `TextField`
- `PasswordField`
- `TextareaField`
- `SelectField`
- `ComboboxField`
- `MultiSelectField`
- `CheckboxField`
- `RadioGroupField`
- `SwitchField`
- `DateField`
- `DateRangeField`
- `FileUploadField`
- `OtpField`
- `PhoneField`

## Styling

Formax UI ships CSS variables and package-owned classes. Tailwind is not required by consumers.

```css
:root {
  --formax-color-primary: #2563eb;
  --formax-radius: 0.75rem;
}
```

You can still compose with Tailwind or your own classes through `className`.

## Development

```bash
npm install
npm run quality
```

Useful scripts:

- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build:lib`
- `npm run test:e2e`
- `npm run changeset`

## Release

This repo is prepared for Changesets and npm provenance publishing. Configure `NPM_TOKEN` in GitHub Actions before publishing.

## Migration From v1

v1 components such as `TextInput`, `Textarea`, `Select`, and `SubmitButton` are still exported temporarily, but v2 development should use the workflow components above. Prefer `TextField` inside `Form` over passing loose `register` props manually.

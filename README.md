# Formax UI

Production-ready React form workflows for React Hook Form, Zod, and modern dashboards.

[![npm version](https://img.shields.io/npm/v/formax-ui.svg)](https://www.npmjs.com/package/formax-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What Formax UI Is

Formax UI is not just another input component pack. It is a React form workflow kit built around:

- React Hook Form context
- Zod validation
- accessible field primitives
- schema-driven form rendering
- multi-step workflows
- CSS-variable styling
- optional server-side AI form configuration

The main package works without AI. AI helpers live in a separate subpath so API keys stay server-side.

## Install

```bash
npm install formax-ui react react-dom react-hook-form @hookform/resolvers zod
```

Import the stylesheet once in your app root:

```tsx
import 'formax-ui/styles.css';
```

## Package Exports

```ts
import { Form, TextField, SchemaForm } from 'formax-ui/workflow';
import { TextInput, SubmitButton } from 'formax-ui/legacy';
import { createFormAssistant, deepSeekProvider } from 'formax-ui/ai';
import { signupTemplate } from 'formax-ui/templates';
import { useFormAutosave } from 'formax-ui/intelligence';
import 'formax-ui/styles.css';
```

Available exports:

- `formax-ui` - backward-compatible root export
- `formax-ui/workflow` - lean v2 workflow API for new code
- `formax-ui/legacy` - temporary v1 aliases
- `formax-ui/ai` - optional server-side AI provider helpers
- `formax-ui/templates` - production workflow templates
- `formax-ui/intelligence` - autosave, draft restore, analytics, and guards
- `formax-ui/styles.css` - package stylesheet
- `formax-ui/legacy.css` - legacy DatePicker stylesheet
- `formax-ui/package.json` - package metadata for tooling

## Quick Start

```tsx
import { Form, FormActions, PasswordField, TextField } from 'formax-ui/workflow';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

export function SignupForm() {
  return (
    <Form
      schema={signupSchema}
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

Use `SchemaForm` when a Zod schema should create the form layout automatically.

```tsx
import { SchemaForm } from 'formax-ui/workflow';
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
      defaultValues={{ email: '', plan: 'starter', newsletter: false }}
      config={{
        layout: 'two-column',
        submitLabel: 'Continue',
        fields: {
          plan: {
            label: 'Plan',
            placeholder: 'Choose a plan',
          },
          newsletter: {
            label: 'Send product updates',
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

`createFormConfigFromZod(schema)` currently infers:

- strings as text fields
- password-like names as password fields
- phone/mobile names as phone fields
- otp/code names as OTP fields
- date-like names as date fields
- booleans as checkbox fields
- arrays as repeatable array fields
- enums as select fields
- optional/nullable fields as not required

Schema configs also support sections, conditional visibility, disabled/read-only rules, and async option loaders.

## Multi-Step Forms

```tsx
import { Form, StepperForm, TextField } from 'formax-ui/workflow';

<Form schema={schema} defaultValues={{ email: '', backupEmail: '' }} onSubmit={onSubmit}>
  <StepperForm
    steps={[
      {
        id: 'account',
        title: 'Account',
        fields: ['email'],
        content: <TextField name="email" label="Email" />,
      },
      {
        id: 'security',
        title: 'Security',
        fields: ['backupEmail'],
        content: <TextField name="backupEmail" label="Backup email" />,
      },
    ]}
  />
</Form>;
```

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

## Core Workflow API

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

## Optional DeepSeek AI Helper

The AI helper generates a validated JSON `SchemaForm` config from a prompt. Use it only on the server.

```ts
import { createFormAssistant, deepSeekProvider } from 'formax-ui/ai';

const assistant = createFormAssistant({
  provider: deepSeekProvider({
    apiKey: process.env.DEEPSEEK_API_KEY!,
  }),
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

Do not expose model API keys in browser code. The package does not read environment variables automatically; your server route owns that decision.

Provider helpers are available for DeepSeek, OpenAI, Anthropic, Gemini, and Vercel-style adapters.

## Templates And Intelligence

```tsx
import { SchemaForm } from 'formax-ui/workflow';
import { checkoutTemplate } from 'formax-ui/templates';

<SchemaForm
  schema={checkoutTemplate.schema}
  defaultValues={checkoutTemplate.defaultValues}
  config={checkoutTemplate.config}
  onSubmit={handleCheckout}
/>;
```

```tsx
import { useFormAutosave, useFormAnalytics } from 'formax-ui/intelligence';

useFormAutosave({ key: 'checkout-draft' });
useFormAnalytics({ onEvent: (event) => console.log(event) });
```

## CLI

```bash
npx formax-ui create-form signup
npx formax-ui create-form checkout --out CheckoutForm.tsx
```

The CLI writes a copyable React starter that uses `SchemaForm`, `formax-ui/workflow`, and `formax-ui/templates`.

## Styling

Formax UI ships plain CSS with design tokens. Tailwind is not required.

```css
:root {
  --formax-color-primary: #2563eb;
  --formax-radius: 0.75rem;
}
```

Every field accepts `className`, and many field configs can be overridden in `SchemaForm`.

## Package Size

`formax-ui@2.1.0` ships focused workflow, legacy, AI, templates, and intelligence entrypoints with package-size budgets in CI.

Current package shape:

- workflow ESM entry: about 32 KB before gzip
- root ESM entry: about 58 KB before gzip
- CSS: about 30 KB before gzip

## Migration From v1

v1 components such as `TextInput`, `Textarea`, `Select`, and `SubmitButton` are still exported temporarily from `formax-ui` and `formax-ui/legacy`. New work should use `formax-ui/workflow`.

Before:

```tsx
<TextInput
  name="email"
  label="Email"
  register={register('email')}
  error={errors.email?.message}
/>
```

After:

```tsx
<Form schema={schema} defaultValues={{ email: '' }} onSubmit={onSubmit}>
  <TextField name="email" label="Email" />
  <FormActions submitLabel="Save" />
</Form>
```

## Troubleshooting

### `Cannot import CSS in Node`

`formax-ui/styles.css` is intended for bundlers such as Next.js, Vite, Remix, Webpack, or similar tools. Raw Node.js cannot execute CSS imports.

### Zod 4 support

Formax UI supports schema automation with Zod 3 and Zod 4. If schema fields render incorrectly, check the installed `zod` version and open an issue with the schema shape.

### AI key safety

Use `formax-ui/ai` in server routes, server actions, API handlers, or backend services. Never import it into client bundles with a real API key.

## Development

```bash
npm install
npm run quality
npm run test:e2e
```

Useful scripts:

- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build:lib`
- `npm run test:package`
- `npm run test:e2e`
- `npm run docs:api`

## Release

The repo publishes through GitHub Actions with npm provenance. Configure `NPM_TOKEN` as a GitHub Actions secret before publishing.

## Roadmap

Near-term:

- add richer array item rendering helpers
- add dependent validation examples
- add visual Studio preview in docs/playground
- add more production examples: checkout, onboarding, invoice, admin settings, uploads
- add more provider-specific AI examples

Longer-term:

- visual form builder that exports Formax config
- CLI scaffolder for common form workflows
- JSON Schema and OpenAPI import
- AI-assisted accessibility and validation review
- form analytics hooks for completion, drop-off, and error hotspots

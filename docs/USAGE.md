# Using Formax UI

This guide shows the recommended v2 workflow. For npm users, the same examples are also summarized in the root `README.md`.

## Install

```bash
npm install formax-ui react react-dom react-hook-form @hookform/resolvers zod
```

Import CSS once:

```tsx
import 'formax-ui/styles.css';
```

## Recommended Pattern

Build forms with `Form` and typed field components. Fields read from React Hook Form context, so you do not pass loose `register` props around.

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
      onSubmit={async (values) => console.log(values)}
    >
      <TextField name="email" label="Email" />
      <PasswordField name="password" label="Password" />
      <FormActions submitLabel="Create account" />
    </Form>
  );
}
```

## Schema-Driven Pattern

Use `SchemaForm` for dashboards, admin tools, and generated workflows where a schema should drive rendering.

```tsx
import { SchemaForm } from 'formax-ui';
import { z } from 'zod';

const schema = z.object({
  companyName: z.string().min(2),
  seats: z.enum(['5', '10', '25']),
  acceptTerms: z.boolean().optional(),
});

export function OnboardingForm() {
  return (
    <SchemaForm
      schema={schema}
      defaultValues={{ companyName: '', seats: '5', acceptTerms: false }}
      config={{
        submitLabel: 'Start onboarding',
        fields: {
          companyName: {
            label: 'Company name',
            placeholder: 'Acme Inc.',
          },
          seats: {
            label: 'Seats',
          },
        },
      }}
      onSubmit={async (values) => console.log(values)}
    />
  );
}
```

## AI-Assisted Config

Use the AI subpath only on the server.

```ts
import { createDeepSeekFormAssistant } from 'formax-ui/ai';

const assistant = createDeepSeekFormAssistant({
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const config = await assistant.generateConfig({
    prompt,
    audience: 'B2B SaaS onboarding',
  });

  return Response.json(config);
}
```

The browser should receive only the generated `SchemaFormConfig`, never the model API key.

## Styling

Formax UI uses package CSS and variables. Tailwind is optional.

```css
:root {
  --formax-color-primary: #2563eb;
  --formax-radius: 0.75rem;
}
```

## When To Use Which API

- Use `Form` plus fields for product forms where developers control the layout.
- Use `SchemaForm` for admin dashboards, generated forms, internal tools, and AI-assisted flows.
- Use `StepperForm` when the workflow has clear stages.
- Use `formax-ui/ai` only in trusted server code.


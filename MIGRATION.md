# Migrating to Formax UI v2

Formax UI v2 changes the package from standalone inputs into a React form workflow kit.

## Main Changes

- Install `react-hook-form`, `@hookform/resolvers`, and `zod` as peer dependencies.
- Import `formax-ui/styles.css` once in your app.
- Prefer `formax-ui/workflow` with field components such as `TextField` and `PasswordField`.
- Use `SchemaForm` when you want to render a form from a Zod schema and config object.
- Use `formax-ui/ai` only from server-side code.
- Prefer v2 workflow fields for all new code. Legacy aliases remain available temporarily.

## Before

```tsx
<TextInput
  name="email"
  label="Email"
  register={register('email')}
  error={errors.email?.message}
/>
```

## After

```tsx
<Form schema={schema} defaultValues={{ email: '' }} onSubmit={onSubmit}>
  <TextField name="email" label="Email" />
  <FormActions submitLabel="Save" />
</Form>
```

## Compatibility

Legacy v1 components remain exported from the package root and from `formax-ui/legacy`, but new work should use `formax-ui/workflow`.

Modern apps can import a lean workflow API without pulling legacy component paths into their app bundle:

```tsx
import { Form, TextField } from 'formax-ui/workflow';
import { TextInput } from 'formax-ui/legacy';
```

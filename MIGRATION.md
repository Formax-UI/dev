# Migrating to Formax UI v2

Formax UI v2 changes the package from standalone inputs into a React form workflow kit.

## Main Changes

- Install `react-hook-form`, `@hookform/resolvers`, and `zod` as peer dependencies.
- Import `formax-ui/styles.css` once in your app.
- Prefer `Form` plus field components such as `TextField` and `PasswordField`.
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

Legacy v1 components remain exported for now, but new work should use the v2 workflow API.

The next package direction is to split workflow and legacy entrypoints so modern apps can import a lean workflow API without pulling legacy component paths into their app bundle.

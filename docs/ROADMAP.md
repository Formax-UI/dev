# Formax UI Roadmap

Formax UI should compete as a React form workflow kit, not as a generic component library.

## Current Position

The package already provides:

- React Hook Form integration
- Zod validation
- typed field components
- schema-driven rendering
- optional DeepSeek config generation
- CSS-variable styling
- CI, package tests, E2E tests, npm provenance publishing
- package-size budgets

## Competitive Direction

Strong competitors and references:

- React Hook Form: performance-focused form state and validation primitives.
- TanStack Form: headless, type-safe, framework-aware form state for complex forms.
- shadcn/ui forms: copyable RHF patterns with strong design-system adoption.
- SurveyJS: JSON-driven forms, visual form builder, surveys, and dashboards.
- Typeform, Tally, Fillout, and Jotform: polished no-code form creation and sharing.
- Vercel AI SDK: provider-agnostic AI application layer.

Formax UI should sit between code-first form libraries and no-code form builders:

- code-first enough for serious React apps
- schema-driven enough for automation
- AI-ready enough for generated internal tools
- styled enough to ship quickly
- headless enough to fit dashboards and design systems

## Next Build Priorities

1. Split package entrypoints.
   - Add `formax-ui/workflow` for the lean v2 workflow API.
   - Add `formax-ui/legacy` for old v1 aliases.
   - Keep root compatibility for now, then document a migration window.

2. Add advanced schema behavior.
   - Conditional visibility.
   - Dependent fields.
   - Repeatable field arrays.
   - Async option loaders.
   - Async validation examples.

3. Make AI provider-agnostic.
   - Keep DeepSeek support.
   - Add a provider adapter shape.
   - Support OpenAI, Anthropic, Gemini, and Vercel AI SDK style adapters.
   - Validate every generated config before rendering.

4. Build a form config studio.
   - Prompt to config.
   - Edit labels, fields, layout, and validation hints.
   - Preview with `SchemaForm`.
   - Export React code and JSON config.

5. Add production templates.
   - Signup.
   - Login.
   - Checkout.
   - SaaS onboarding.
   - Admin settings.
   - Invoice editor.
   - File upload.
   - Support/contact flow.

6. Improve release confidence.
   - Add consumer fixture tests for Next.js and Vite.
   - Add bundle-size tests for `formax-ui/workflow`.
   - Add browser accessibility E2E coverage for every template.

## AI Safety Rules

- Never use model API keys in browser bundles.
- Treat AI output as untrusted input.
- Validate generated configs before rendering.
- Keep allowlists for supported field components.
- Reject unknown component names, unsafe HTML, and unexpected config keys.


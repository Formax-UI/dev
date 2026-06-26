# Formax UI Roadmap

Formax UI should compete as a React form workflow kit, not as a generic component library.

## Current Position

The package already provides:

- React Hook Form integration
- Zod validation
- typed field components
- schema-driven rendering
- focused `workflow`, `legacy`, `ai`, `templates`, and `intelligence` entrypoints
- provider-based AI config generation
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

1. Build a form config studio.
   - Prompt to config.
   - Edit labels, fields, layout, and validation hints.
   - Preview with `SchemaForm`.
   - Export React code and JSON config.

2. Improve production depth.
   - Richer array item rendering helpers.
   - Dependent validation examples.
   - More provider-specific AI examples.
   - Design-system adapters for shadcn, MUI, Ant Design, and Mantine.

3. Improve release confidence.
   - Add consumer fixture tests for Next.js and Vite.
   - Add browser accessibility E2E coverage for every template.

## AI Safety Rules

- Never use model API keys in browser bundles.
- Treat AI output as untrusted input.
- Validate generated configs before rendering.
- Keep allowlists for supported field components.
- Reject unknown component names, unsafe HTML, and unexpected config keys.

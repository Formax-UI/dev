import { describe, expect, it } from 'vitest';
import {
  createWorkflowFromPrompt,
  diffWorkflowConfigs,
  generateConfigJson,
  generateReactFormCode,
  generateZodSchemaCode,
  normalizeFormaxWorkflow,
  validateFormaxWorkflow,
} from '../studio-core';
import { createFormaxAdapter, shadcnAdapter } from '../adapters';

describe('studio-core', () => {
  it('creates and validates a workflow from a prompt', () => {
    const workflow = createWorkflowFromPrompt({
      prompt: 'Create an enterprise checkout form with billing and plan fields',
    });
    const result = validateFormaxWorkflow(workflow);

    expect(result.success).toBe(true);
    expect(workflow.config.fields?.plan?.component).toBe('select');
    expect(workflow.config.sections?.billing?.title).toBe('Billing');
  });

  it('rejects unsafe workflow output', () => {
    const result = validateFormaxWorkflow({
      config: {
        fields: {
          name: {
            component: 'text',
            dangerouslySetInnerHTML: '<script>alert(1)</script>',
          },
        },
      },
      id: 'unsafe',
      name: 'Unsafe',
      schema: 'zod',
    });

    expect(result.success).toBe(false);
    expect(result.errors.map((issue) => issue.path).join(' ')).toContain('dangerouslySetInnerHTML');
  });

  it('generates copyable React, Zod, and JSON exports', () => {
    const workflow = normalizeFormaxWorkflow({
      config: {
        submitLabel: 'Create account',
        fields: {
          email: { component: 'text', label: 'Email', required: true },
          password: { component: 'password', label: 'Password', required: true },
        },
      },
      name: 'Signup',
    });

    expect(generateReactFormCode({ config: workflow })).toContain('export function SignupForm');
    expect(generateZodSchemaCode(workflow)).toContain("email: z.string().email('Enter a valid email')");
    expect(generateConfigJson(workflow)).toContain('"schema": "zod"');
  });

  it('diffs workflow config changes', () => {
    const before = createWorkflowFromPrompt({ prompt: 'Create a signup form' });
    const after = normalizeFormaxWorkflow({
      ...before,
      config: {
        ...before.config,
        submitLabel: 'Join now',
      },
    });

    expect(diffWorkflowConfigs(before, after)).toContainEqual({
      after: 'Join now',
      before: 'Create account',
      path: 'workflow.config.submitLabel',
      type: 'changed',
    });
  });

  it('exposes adapter metadata helpers', () => {
    const adapter = createFormaxAdapter({
      name: 'custom',
      supportedComponents: ['text'],
    });

    expect(adapter.name).toBe('custom');
    expect(shadcnAdapter.supportedComponents).toContain('select');
  });
});

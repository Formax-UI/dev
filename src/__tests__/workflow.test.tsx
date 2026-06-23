import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  CheckboxField,
  Form,
  FormActions,
  SchemaForm,
  TextField,
  createFormConfigFromZod,
} from '../index';

describe('Formax v2 workflow API', () => {
  it('submits typed React Hook Form values validated by Zod', async () => {
    const onSubmit = vi.fn();
    const schema = z.object({
      email: z.string().email('Enter a valid email'),
      accepted: z.boolean().refine(Boolean, 'Accept the terms'),
    });

    render(
      <Form
        schema={schema}
        defaultValues={{ email: '', accepted: false }}
        onSubmit={onSubmit}
      >
        <TextField name="email" label="Email" />
        <CheckboxField name="accepted" label="Terms" checkboxLabel="I accept" />
        <FormActions submitLabel="Create account" />
      </Form>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'team@formax.dev' } });
    fireEvent.click(screen.getByLabelText('I accept'));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'team@formax.dev', accepted: true },
        expect.any(Object)
      );
    });
  });

  it('creates a usable SchemaForm config from a Zod object', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      newsletter: z.boolean().optional(),
    });

    expect(createFormConfigFromZod(schema)).toEqual([
      expect.objectContaining({ component: 'text', label: 'Email', name: 'email', required: true }),
      expect.objectContaining({ component: 'password', label: 'Password', name: 'password', required: true }),
      expect.objectContaining({ component: 'checkbox', label: 'Newsletter', name: 'newsletter', required: false }),
    ]);
  });

  it('renders schema-driven forms with configured fields', () => {
    const schema = z.object({
      plan: z.enum(['starter', 'pro']),
    });

    render(
      <SchemaForm
        schema={schema}
        defaultValues={{ plan: '' }}
        config={{
          submitLabel: 'Continue',
          fields: {
            plan: {
              label: 'Plan',
              placeholder: 'Choose a plan',
            },
          },
        }}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Plan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('has no basic accessibility violations for a common form', async () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const { container } = render(
      <Form schema={schema} defaultValues={{ email: '' }} onSubmit={vi.fn()}>
        <TextField name="email" label="Email" description="Use your work email." />
        <FormActions />
      </Form>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

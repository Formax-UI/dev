import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Form, FormActions, TextField } from '../workflow';
import { useFormAnalytics, useFormAutosave } from '../intelligence';

function IntelligenceHarness({
  onEvent,
  storage,
}: {
  onEvent: ReturnType<typeof vi.fn>;
  storage: Storage;
}) {
  useFormAutosave({ debounceMs: 1, key: 'draft', storage });
  const analytics = useFormAnalytics({ onEvent });

  return (
    <>
      <TextField name="email" label="Email" onBlur={() => analytics.trackFieldBlur('email')} />
      <FormActions submitLabel="Save" />
    </>
  );
}

describe('form intelligence hooks', () => {
  it('autosaves values and emits analytics events only through callbacks', async () => {
    const onEvent = vi.fn();
    const storage = window.localStorage;
    storage.clear();

    render(
      <Form
        schema={z.object({ email: z.string().email('Enter a valid email') })}
        defaultValues={{ email: '' }}
        onSubmit={vi.fn()}
      >
        <IntelligenceHarness onEvent={onEvent} storage={storage} />
      </Form>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad-email' } });
    fireEvent.blur(screen.getByLabelText('Email'));

    await waitFor(() => {
      expect(storage.getItem('draft')).toContain('bad-email');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith({ type: 'field_blur', field: 'email' });
      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({ field: 'email', type: 'field_error' })
      );
    });
  });
});

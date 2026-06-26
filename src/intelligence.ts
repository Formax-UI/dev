import { useEffect, useRef } from 'react';
import { FieldValues, useFormContext } from 'react-hook-form';

export type FormaxAnalyticsEvent =
  | { type: 'field_blur'; field: string }
  | { type: 'field_error'; field: string; message: string }
  | { type: 'submit_attempt' }
  | { type: 'submit_success' }
  | { type: 'submit_error'; message: string };

export type FormaxStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

const getDefaultStorage = (): FormaxStorage | undefined =>
  typeof window === 'undefined' ? undefined : window.localStorage;

export function useFormAutosave<TValues extends FieldValues = FieldValues>({
  debounceMs = 500,
  key,
  storage = getDefaultStorage(),
}: {
  debounceMs?: number;
  key: string;
  storage?: FormaxStorage;
}) {
  const methods = useFormContext<TValues>();
  const values = methods.watch();

  useEffect(() => {
    if (!storage) return undefined;

    const timeout = setTimeout(() => {
      storage.setItem(key, JSON.stringify(values));
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [debounceMs, key, storage, values]);
}

export function useDraftRestore<TValues extends FieldValues = FieldValues>({
  key,
  storage = getDefaultStorage(),
}: {
  key: string;
  storage?: FormaxStorage;
}) {
  const methods = useFormContext<TValues>();

  useEffect(() => {
    if (!storage) return;

    const rawValue = storage.getItem(key);
    if (!rawValue) return;

    try {
      methods.reset(JSON.parse(rawValue));
    } catch {
      storage.removeItem(key);
    }
  }, [key, methods, storage]);
}

export function useUnsavedChangesGuard({ enabled = true }: { enabled?: boolean } = {}) {
  const methods = useFormContext();
  const isDirty = methods.formState.isDirty;

  useEffect(() => {
    if (!enabled || !isDirty || typeof window === 'undefined') return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, isDirty]);
}

export function useFormAnalytics({
  onEvent,
}: {
  onEvent?: (event: FormaxAnalyticsEvent) => void;
}) {
  const methods = useFormContext();
  const previousSubmitCount = useRef(0);
  const previousErrors = useRef('');

  useEffect(() => {
    if (!onEvent) return;

    const serializedErrors = Object.entries(methods.formState.errors)
      .map(([field, error]) => `${field}:${String(error?.message || '')}`)
      .join('|');
    if (serializedErrors === previousErrors.current) return;

    previousErrors.current = serializedErrors;
    Object.entries(methods.formState.errors).forEach(([field, error]) => {
      onEvent({ type: 'field_error', field, message: String(error?.message || `${field} is invalid`) });
    });
  }, [methods.formState.errors, onEvent]);

  useEffect(() => {
    if (!onEvent) return;
    if (methods.formState.submitCount === previousSubmitCount.current) return;

    previousSubmitCount.current = methods.formState.submitCount;
    onEvent({ type: 'submit_attempt' });

    if (methods.formState.isSubmitSuccessful) {
      onEvent({ type: 'submit_success' });
    }
  }, [methods.formState.isSubmitSuccessful, methods.formState.submitCount, onEvent]);

  return {
    trackFieldBlur: (field: string) => onEvent?.({ type: 'field_blur', field }),
    trackSubmitError: (message: string) => onEvent?.({ type: 'submit_error', message }),
  };
}

import React, { createContext, useContext, useId, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FieldValues,
  FormProvider as HookFormProvider,
  Path,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { z } from 'zod';
import { cn } from '../utils/cn';

type FormaxFormContextValue = {
  formId: string;
};

const FormaxFormContext = createContext<FormaxFormContextValue | null>(null);

export type FormaxFormProps<TValues extends FieldValues = FieldValues> = {
  children: React.ReactNode | ((methods: UseFormReturn<TValues>) => React.ReactNode);
  className?: string;
  defaultValues?: UseFormProps<TValues>['defaultValues'];
  form?: UseFormReturn<TValues>;
  id?: string;
  mode?: UseFormProps<TValues>['mode'];
  noValidate?: boolean;
  onSubmit: (values: TValues, methods: UseFormReturn<TValues>) => void | Promise<void>;
  schema?: z.ZodType<TValues>;
};

export function useFormaxForm<TValues extends FieldValues = FieldValues>(
  options: Omit<UseFormProps<TValues>, 'resolver'> & { schema?: z.ZodType<TValues> } = {}
) {
  const { schema, ...formOptions } = options;

  return useForm<TValues>({
    ...formOptions,
    resolver: schema ? zodResolver(schema) : undefined,
  });
}

export function Form<TValues extends FieldValues = FieldValues>({
  children,
  className,
  defaultValues,
  form,
  id,
  mode = 'onSubmit',
  noValidate = true,
  onSubmit,
  schema,
}: FormaxFormProps<TValues>) {
  const generatedId = useId();
  const internalForm = useFormaxForm<TValues>({ defaultValues, mode, schema });
  const methods = form || internalForm;
  const formId = id || generatedId;
  const contextValue = useMemo(() => ({ formId }), [formId]);

  const handleSubmit: SubmitHandler<TValues> = async (values) => {
    await onSubmit(values, methods);
  };

  return (
    <FormaxFormContext.Provider value={contextValue}>
      <HookFormProvider {...methods}>
        <form
          id={formId}
          noValidate={noValidate}
          onSubmit={methods.handleSubmit(handleSubmit)}
          className={cn('formax-form', className)}
        >
          {typeof children === 'function' ? children(methods) : children}
        </form>
      </HookFormProvider>
    </FormaxFormContext.Provider>
  );
}

export type UseFormFieldResult = {
  describedBy?: string;
  descriptionId: string;
  error?: string;
  errorId: string;
  fieldId: string;
  invalid: boolean;
};

export function useFormField<TValues extends FieldValues = FieldValues>(name: Path<TValues>) {
  const methods = useFormContext<TValues>();
  const formContext = useContext(FormaxFormContext);
  const reactId = useId();
  const baseId = `${formContext?.formId || 'formax'}-${String(name).replace(/\./g, '-') || reactId}`;
  const state = methods.getFieldState(name, methods.formState);
  const error = state.error?.message ? String(state.error.message) : undefined;
  const errorId = `${baseId}-error`;
  const descriptionId = `${baseId}-description`;

  return {
    describedBy: error ? errorId : descriptionId,
    descriptionId,
    error,
    errorId,
    fieldId: baseId,
    invalid: !!error,
  } satisfies UseFormFieldResult;
}

export type FieldProps<TValues extends FieldValues = FieldValues> = {
  children: (field: UseFormFieldResult) => React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  label?: React.ReactNode;
  name: Path<TValues>;
  required?: boolean;
};

export function Field<TValues extends FieldValues = FieldValues>({
  children,
  className,
  description,
  label,
  name,
  required,
}: FieldProps<TValues>) {
  const field = useFormField<TValues>(name);

  return (
    <div className={cn('formax-field-group', className)}>
      {label && (
        <label htmlFor={field.fieldId} className={cn('formax-label', { 'formax-label-required': required })}>
          {label}
        </label>
      )}
      {description && (
        <p id={field.descriptionId} className="formax-description">
          {description}
        </p>
      )}
      {children(field)}
      <FieldError id={field.errorId} message={field.error} />
    </div>
  );
}

export type FieldErrorProps = {
  className?: string;
  id?: string;
  message?: React.ReactNode;
};

export function FieldError({ className, id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className={cn('formax-error', className)}>
      {message}
    </p>
  );
}

export type ErrorSummaryProps = {
  className?: string;
  title?: string;
};

export function ErrorSummary({ className, title = 'Please fix the following fields' }: ErrorSummaryProps) {
  const methods = useFormContext();
  const errors = Object.entries(methods.formState.errors);

  if (errors.length === 0) {
    return null;
  }

  return (
    <div role="alert" className={cn('formax-error-summary', className)}>
      <p className="formax-error-summary-title">{title}</p>
      <ul className="formax-error-summary-list">
        {errors.map(([name, error]) => (
          <li key={name}>{String(error?.message || `${name} is invalid`)}</li>
        ))}
      </ul>
    </div>
  );
}

export type FormSectionProps = {
  children: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  title?: React.ReactNode;
};

export function FormSection({ children, className, description, title }: FormSectionProps) {
  return (
    <section className={cn('formax-section', className)}>
      {(title || description) && (
        <header className="formax-section-header">
          {title && <h2 className="formax-section-title">{title}</h2>}
          {description && <p className="formax-section-description">{description}</p>}
        </header>
      )}
      <div className="formax-section-content">{children}</div>
    </section>
  );
}

export type FormActionsProps = {
  align?: 'left' | 'right' | 'between';
  cancelLabel?: string;
  className?: string;
  onCancel?: () => void;
  submitLabel?: string;
};

export function FormActions({
  align = 'right',
  cancelLabel = 'Cancel',
  className,
  onCancel,
  submitLabel = 'Submit',
}: FormActionsProps) {
  const methods = useFormContext();
  const isSubmitting = methods.formState.isSubmitting;

  return (
    <div className={cn('formax-actions', `formax-actions-${align}`, className)}>
      {onCancel && (
        <button type="button" className="formax-button formax-button-secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
      )}
      <button type="submit" className="formax-button formax-button-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </div>
  );
}

export type StepperFormStep = {
  content: React.ReactNode;
  description?: React.ReactNode;
  fields?: string[];
  id: string;
  title: React.ReactNode;
};

export type StepperFormProps = {
  className?: string;
  initialStep?: number;
  steps: StepperFormStep[];
};

export function StepperForm({ className, initialStep = 0, steps }: StepperFormProps) {
  const methods = useFormContext();
  const [activeStep, setActiveStep] = useState(initialStep);
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;
  const step = steps[activeStep];

  const goNext = async () => {
    const fields = step.fields || [];
    const isValid = fields.length === 0 ? true : await methods.trigger(fields);

    if (isValid && !isLastStep) {
      setActiveStep((current) => current + 1);
    }
  };

  return (
    <div className={cn('formax-stepper', className)}>
      <ol className="formax-stepper-list" aria-label="Form steps">
        {steps.map((item, index) => (
          <li key={item.id} className={cn('formax-stepper-item', { 'is-active': index === activeStep })}>
            <button
              type="button"
              className="formax-stepper-button"
              onClick={() => setActiveStep(index)}
              aria-current={index === activeStep ? 'step' : undefined}
            >
              <span className="formax-stepper-index">{index + 1}</span>
              <span>
                <span className="formax-stepper-title">{item.title}</span>
                {item.description && <span className="formax-stepper-description">{item.description}</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="formax-stepper-panel">{step.content}</div>

      <div className="formax-actions formax-actions-between">
        <button
          type="button"
          className="formax-button formax-button-secondary"
          disabled={isFirstStep}
          onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
        >
          Previous
        </button>
        {isLastStep ? (
          <button type="submit" className="formax-button formax-button-primary" disabled={methods.formState.isSubmitting}>
            {methods.formState.isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button type="button" className="formax-button formax-button-primary" onClick={goNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

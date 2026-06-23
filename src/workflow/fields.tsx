import React, { useMemo } from 'react';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import { cn } from '../utils/cn';
import { Field } from './Form';

export type FormaxOption = {
  description?: string;
  disabled?: boolean;
  label: string;
  value: string;
};

type FieldBaseProps<TValues extends FieldValues = FieldValues> = {
  className?: string;
  description?: React.ReactNode;
  disabled?: boolean;
  label?: React.ReactNode;
  name: Path<TValues>;
  placeholder?: string;
  required?: boolean;
};

export type TextFieldProps<TValues extends FieldValues = FieldValues> = FieldBaseProps<TValues> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'disabled' | 'name' | 'required'> & {
    inputClassName?: string;
  };

export function TextField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  inputClassName,
  label,
  name,
  placeholder,
  required,
  type = 'text',
  ...inputProps
}: TextFieldProps<TValues>) {
  const methods = useFormContext<TValues>();

  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <input
          id={field.fieldId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={field.invalid}
          aria-describedby={field.describedBy}
          className={cn('formax-control', inputClassName)}
          {...methods.register(name)}
          {...inputProps}
        />
      )}
    </Field>
  );
}

export function PasswordField<TValues extends FieldValues = FieldValues>(props: Omit<TextFieldProps<TValues>, 'type'>) {
  return <TextField {...props} type="password" autoComplete={props.autoComplete || 'current-password'} />;
}

export type TextareaFieldProps<TValues extends FieldValues = FieldValues> = FieldBaseProps<TValues> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'disabled' | 'name' | 'required'> & {
    textareaClassName?: string;
  };

export function TextareaField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  label,
  name,
  placeholder,
  required,
  textareaClassName,
  ...textareaProps
}: TextareaFieldProps<TValues>) {
  const methods = useFormContext<TValues>();

  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <textarea
          id={field.fieldId}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={field.invalid}
          aria-describedby={field.describedBy}
          className={cn('formax-control formax-textarea', textareaClassName)}
          {...methods.register(name)}
          {...textareaProps}
        />
      )}
    </Field>
  );
}

export type SelectFieldProps<TValues extends FieldValues = FieldValues> = FieldBaseProps<TValues> & {
  options: FormaxOption[];
  selectClassName?: string;
};

export function SelectField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  label,
  name,
  options,
  placeholder = 'Select an option',
  required,
  selectClassName,
}: SelectFieldProps<TValues>) {
  const methods = useFormContext<TValues>();

  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <select
          id={field.fieldId}
          disabled={disabled}
          aria-invalid={field.invalid}
          aria-describedby={field.describedBy}
          className={cn('formax-control', selectClassName)}
          {...methods.register(name)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function ComboboxField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  label,
  name,
  options,
  placeholder,
  required,
}: SelectFieldProps<TValues>) {
  const methods = useFormContext<TValues>();
  const listId = useMemo(() => `formax-${String(name).replace(/\./g, '-')}-options`, [name]);

  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <>
          <input
            id={field.fieldId}
            list={listId}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={field.invalid}
            aria-describedby={field.describedBy}
            className="formax-control"
            {...methods.register(name)}
          />
          <datalist id={listId}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </datalist>
        </>
      )}
    </Field>
  );
}

export type MultiSelectFieldProps<TValues extends FieldValues = FieldValues> = FieldBaseProps<TValues> & {
  options: FormaxOption[];
};

export function MultiSelectField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  label,
  name,
  options,
  required,
}: MultiSelectFieldProps<TValues>) {
  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <Controller
          name={name}
          render={({ field: controllerField }) => {
            const value = Array.isArray(controllerField.value) ? (controllerField.value as string[]) : [];

            return (
              <div className="formax-choice-list" aria-describedby={field.describedBy} aria-invalid={field.invalid}>
                {options.map((option) => {
                  const checked = value.includes(option.value);

                  return (
                    <label key={option.value} className="formax-choice">
                      <input
                        type="checkbox"
                        disabled={disabled || option.disabled}
                        checked={checked}
                        onChange={() => {
                          const nextValue = checked
                            ? value.filter((item: string) => item !== option.value)
                            : [...value, option.value];
                          controllerField.onChange(nextValue);
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            );
          }}
        />
      )}
    </Field>
  );
}

export type CheckboxFieldProps<TValues extends FieldValues = FieldValues> = FieldBaseProps<TValues> & {
  checkboxLabel?: React.ReactNode;
};

export function CheckboxField<TValues extends FieldValues = FieldValues>({
  checkboxLabel,
  className,
  description,
  disabled,
  label,
  name,
  required,
}: CheckboxFieldProps<TValues>) {
  const methods = useFormContext<TValues>();

  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <label className="formax-choice">
          <input
            id={field.fieldId}
            type="checkbox"
            disabled={disabled}
            aria-invalid={field.invalid}
            aria-describedby={field.describedBy}
            {...methods.register(name)}
          />
          <span>{checkboxLabel || label}</span>
        </label>
      )}
    </Field>
  );
}

export type RadioGroupFieldProps<TValues extends FieldValues = FieldValues> = FieldBaseProps<TValues> & {
  direction?: 'horizontal' | 'vertical';
  options: FormaxOption[];
};

export function RadioGroupField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  direction = 'vertical',
  disabled,
  label,
  name,
  options,
  required,
}: RadioGroupFieldProps<TValues>) {
  const methods = useFormContext<TValues>();

  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <div
          className={cn('formax-choice-list', { 'formax-choice-list-horizontal': direction === 'horizontal' })}
          role="radiogroup"
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid}
        >
          {options.map((option) => (
            <label key={option.value} className="formax-choice">
              <input
                type="radio"
                value={option.value}
                disabled={disabled || option.disabled}
                {...methods.register(name)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </Field>
  );
}

export function SwitchField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  label,
  name,
  required,
}: FieldBaseProps<TValues>) {
  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <Controller
          name={name}
          render={({ field: controllerField }) => (
            <button
              id={field.fieldId}
              type="button"
              role="switch"
              disabled={disabled}
              aria-checked={!!controllerField.value}
              aria-describedby={field.describedBy}
              className={cn('formax-switch', { 'is-checked': !!controllerField.value })}
              onClick={() => controllerField.onChange(!controllerField.value)}
            >
              <span className="formax-switch-thumb" />
            </button>
          )}
        />
      )}
    </Field>
  );
}

export function DateField<TValues extends FieldValues = FieldValues>(props: Omit<TextFieldProps<TValues>, 'type'>) {
  return <TextField {...props} type="date" />;
}

export type DateRangeFieldProps<TValues extends FieldValues = FieldValues> = FieldBaseProps<TValues> & {
  endLabel?: string;
  startLabel?: string;
};

export function DateRangeField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  endLabel = 'End date',
  label,
  name,
  required,
  startLabel = 'Start date',
}: DateRangeFieldProps<TValues>) {
  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <Controller
          name={name}
          render={({ field: controllerField }) => {
            const value = (controllerField.value || {}) as { end?: string; start?: string };

            return (
              <div className="formax-date-range" aria-describedby={field.describedBy} aria-invalid={field.invalid}>
                <label>
                  <span>{startLabel}</span>
                  <input
                    type="date"
                    className="formax-control"
                    disabled={disabled}
                    value={value.start || ''}
                    onChange={(event) => controllerField.onChange({ ...value, start: event.target.value })}
                  />
                </label>
                <label>
                  <span>{endLabel}</span>
                  <input
                    type="date"
                    className="formax-control"
                    disabled={disabled}
                    value={value.end || ''}
                    onChange={(event) => controllerField.onChange({ ...value, end: event.target.value })}
                  />
                </label>
              </div>
            );
          }}
        />
      )}
    </Field>
  );
}

export function FileUploadField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  label,
  name,
  required,
  ...inputProps
}: TextFieldProps<TValues>) {
  const methods = useFormContext<TValues>();

  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <input
          id={field.fieldId}
          type="file"
          disabled={disabled}
          aria-invalid={field.invalid}
          aria-describedby={field.describedBy}
          className="formax-control formax-file"
          {...methods.register(name)}
          {...inputProps}
        />
      )}
    </Field>
  );
}

export type OtpFieldProps<TValues extends FieldValues = FieldValues> = FieldBaseProps<TValues> & {
  length?: number;
};

export function OtpField<TValues extends FieldValues = FieldValues>({
  className,
  description,
  disabled,
  label,
  length = 6,
  name,
  required,
}: OtpFieldProps<TValues>) {
  return (
    <Field<TValues> className={className} description={description} label={label} name={name} required={required}>
      {(field) => (
        <Controller
          name={name}
          render={({ field: controllerField }) => {
            const value = String(controllerField.value || '').padEnd(length, ' ');

            return (
              <div className="formax-otp" aria-describedby={field.describedBy} aria-invalid={field.invalid}>
                {Array.from({ length }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="formax-otp-input"
                    disabled={disabled}
                    value={value[index]?.trim() || ''}
                    aria-label={`Digit ${index + 1}`}
                    onChange={(event) => {
                      const chars = value.split('');
                      chars[index] = event.target.value.slice(-1);
                      controllerField.onChange(chars.join('').trim());
                    }}
                  />
                ))}
              </div>
            );
          }}
        />
      )}
    </Field>
  );
}

export function PhoneField<TValues extends FieldValues = FieldValues>(props: Omit<TextFieldProps<TValues>, 'type'>) {
  return <TextField {...props} type="tel" inputMode="tel" autoComplete={props.autoComplete || 'tel'} />;
}

import React from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormActions, FormaxFormProps } from './Form';
import {
  CheckboxField,
  DateField,
  FileUploadField,
  MultiSelectField,
  OtpField,
  PasswordField,
  PhoneField,
  RadioGroupField,
  SelectField,
  TextField,
  TextareaField,
  FormaxOption,
} from './fields';

export type SchemaFieldComponent =
  | 'checkbox'
  | 'date'
  | 'file'
  | 'multiselect'
  | 'otp'
  | 'password'
  | 'phone'
  | 'radio'
  | 'select'
  | 'text'
  | 'textarea';

export type SchemaFieldConfig = {
  className?: string;
  component?: SchemaFieldComponent;
  description?: string;
  hidden?: boolean;
  label?: string;
  name: string;
  options?: FormaxOption[];
  placeholder?: string;
  required?: boolean;
};

export type SchemaFormConfig = {
  fields?: Record<string, Partial<SchemaFieldConfig>>;
  layout?: 'single' | 'two-column';
  submitLabel?: string;
};

type ZodObjectLike = z.ZodObject<z.ZodRawShape>;

const labelsFromName = (name: string) =>
  name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();

const getShape = (schema: z.ZodTypeAny) => {
  if (schema instanceof z.ZodObject) {
    return (schema as ZodObjectLike).shape;
  }

  return {};
};

const isOptional = (schema: z.ZodTypeAny) =>
  schema instanceof z.ZodOptional || schema instanceof z.ZodNullable || schema.isOptional();

const unwrap = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable || schema instanceof z.ZodDefault) {
    return unwrap(schema._def.innerType);
  }

  if (schema instanceof z.ZodEffects) {
    return unwrap(schema._def.schema);
  }

  return schema;
};

const inferComponent = (name: string, schema: z.ZodTypeAny): SchemaFieldComponent => {
  const unwrapped = unwrap(schema);
  const lowerName = name.toLowerCase();

  if (lowerName.includes('password')) return 'password';
  if (lowerName.includes('phone') || lowerName.includes('mobile')) return 'phone';
  if (lowerName.includes('otp') || lowerName.includes('code')) return 'otp';
  if (lowerName.includes('date')) return 'date';
  if (unwrapped instanceof z.ZodBoolean) return 'checkbox';
  if (unwrapped instanceof z.ZodArray) return 'multiselect';
  if (unwrapped instanceof z.ZodEnum) return 'select';
  if (unwrapped instanceof z.ZodString && lowerName.includes('message')) return 'textarea';

  return 'text';
};

const optionsFromSchema = (schema: z.ZodTypeAny): FormaxOption[] | undefined => {
  const unwrapped = unwrap(schema);

  if (unwrapped instanceof z.ZodEnum) {
    return unwrapped.options.map((value: string) => ({ label: labelsFromName(value), value }));
  }

  return undefined;
};

export function createFormConfigFromZod(schema: z.ZodTypeAny, config: SchemaFormConfig = {}): SchemaFieldConfig[] {
  const shape = getShape(schema);

  return Object.entries(shape)
    .map(([name, fieldSchema]) => {
      const override = config.fields?.[name] || {};

      return {
        component: inferComponent(name, fieldSchema),
        label: labelsFromName(name),
        name,
        options: optionsFromSchema(fieldSchema),
        required: !isOptional(fieldSchema),
        ...override,
      };
    })
    .filter((field) => !field.hidden);
}

export type SchemaFormProps<TValues extends FieldValues = FieldValues> = Omit<
  FormaxFormProps<TValues>,
  'children'
> & {
  config?: SchemaFormConfig;
};

export function SchemaForm<TValues extends FieldValues = FieldValues>({
  config = {},
  schema,
  ...formProps
}: SchemaFormProps<TValues>) {
  const fields = schema ? createFormConfigFromZod(schema, config) : [];

  return (
    <Form<TValues> schema={schema} {...formProps}>
      <div className={config.layout === 'two-column' ? 'formax-grid formax-grid-2' : 'formax-grid'}>
        {fields.map((field) => (
          <SchemaField key={field.name} field={field} />
        ))}
      </div>
      <FormActions submitLabel={config.submitLabel} />
    </Form>
  );
}

function SchemaField({ field }: { field: SchemaFieldConfig }) {
  const common = {
    className: field.className,
    description: field.description,
    label: field.label,
    name: field.name,
    placeholder: field.placeholder,
    required: field.required,
  };

  switch (field.component) {
    case 'checkbox':
      return <CheckboxField {...common} />;
    case 'date':
      return <DateField {...common} />;
    case 'file':
      return <FileUploadField {...common} />;
    case 'multiselect':
      return <MultiSelectField {...common} options={field.options || []} />;
    case 'otp':
      return <OtpField {...common} />;
    case 'password':
      return <PasswordField {...common} />;
    case 'phone':
      return <PhoneField {...common} />;
    case 'radio':
      return <RadioGroupField {...common} options={field.options || []} />;
    case 'select':
      return <SelectField {...common} options={field.options || []} />;
    case 'textarea':
      return <TextareaField {...common} />;
    case 'text':
    default:
      return <TextField {...common} />;
  }
}

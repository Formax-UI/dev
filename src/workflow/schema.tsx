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

type SchemaShape = Record<string, z.ZodTypeAny>;
type ZodDefLike = {
  entries?: Record<string, string>;
  in?: z.ZodTypeAny;
  innerType?: z.ZodTypeAny;
  schema?: z.ZodTypeAny;
  shape?: unknown;
  type?: unknown;
  typeName?: unknown;
  values?: readonly string[];
};
type ZodLike = z.ZodTypeAny & {
  _def?: ZodDefLike;
  isOptional?: () => boolean;
  options?: readonly string[];
  shape?: unknown;
};

const labelsFromName = (name: string) =>
  name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readShape = (value: unknown) => (typeof value === 'function' ? value() : value);

const getKind = (schema: z.ZodTypeAny) => {
  const def = (schema as ZodLike)._def;

  if (typeof def?.type === 'string') return def.type;
  if (typeof def?.typeName === 'string') return def.typeName;

  return schema.constructor.name;
};

const isKind = (schema: z.ZodTypeAny, ...kinds: string[]) => kinds.includes(getKind(schema));

const getShape = (schema: z.ZodTypeAny): SchemaShape => {
  const schemaLike = schema as ZodLike;
  const shape = readShape(schemaLike.shape) || readShape(schemaLike._def?.shape);

  return isRecord(shape) ? (shape as SchemaShape) : {};
};

const isOptional = (schema: z.ZodTypeAny) => {
  const schemaLike = schema as ZodLike;

  return (
    isKind(schema, 'optional', 'nullable', 'ZodOptional', 'ZodNullable') ||
    Boolean(schemaLike.isOptional?.())
  );
};

const unwrap = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  const schemaLike = schema as ZodLike;
  const wrappedSchema =
    schemaLike._def?.innerType ||
    schemaLike._def?.schema ||
    schemaLike._def?.in;

  if (
    wrappedSchema &&
    isKind(
      schema,
      'optional',
      'nullable',
      'default',
      'catch',
      'effects',
      'pipe',
      'ZodOptional',
      'ZodNullable',
      'ZodDefault',
      'ZodCatch',
      'ZodEffects',
      'ZodPipeline'
    )
  ) {
    return unwrap(wrappedSchema);
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
  if (isKind(unwrapped, 'boolean', 'ZodBoolean')) return 'checkbox';
  if (isKind(unwrapped, 'array', 'ZodArray')) return 'multiselect';
  if (isKind(unwrapped, 'enum', 'ZodEnum')) return 'select';
  if (isKind(unwrapped, 'string', 'ZodString') && lowerName.includes('message')) return 'textarea';

  return 'text';
};

const optionsFromSchema = (schema: z.ZodTypeAny): FormaxOption[] | undefined => {
  const unwrapped = unwrap(schema);

  if (isKind(unwrapped, 'enum', 'ZodEnum')) {
    const schemaLike = unwrapped as ZodLike;
    const values = schemaLike.options || schemaLike._def?.values || Object.keys(schemaLike._def?.entries || {});

    return values.map((value) => ({ label: labelsFromName(value), value }));
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

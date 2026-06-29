import React, { useEffect, useMemo, useState } from 'react';
import { FieldValues, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormActions, FormSection, FormaxFormProps, StepperForm } from './Form';
import {
  ArrayField,
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
  | 'array'
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
  defaultItem?: Record<string, unknown>;
  description?: string;
  disabled?: boolean;
  disabledWhen?: FormaxCondition;
  hidden?: boolean;
  label?: string;
  maxItems?: number;
  minItems?: number;
  name: string;
  options?: FormaxOption[];
  optionSource?: string;
  placeholder?: string;
  readOnly?: boolean;
  readOnlyWhen?: FormaxCondition;
  required?: boolean;
  requiredWhen?: FormaxCondition;
  section?: string;
  visibleWhen?: FormaxCondition;
};

export type FormaxStepConfig = {
  description?: React.ReactNode;
  fields: string[];
  id: string;
  title: React.ReactNode;
};

export type SchemaFormConfig = {
  fields?: Record<string, Partial<SchemaFieldConfig>>;
  layout?: 'single' | 'two-column' | 'responsive-grid';
  sections?: Record<string, SchemaFormSectionConfig>;
  steps?: FormaxStepConfig[];
  submitLabel?: string;
};

export type SchemaFormSectionConfig = {
  className?: string;
  description?: React.ReactNode;
  title?: React.ReactNode;
};

export type FormaxCondition =
  | { field: string; op: 'equals' | 'notEquals' | 'exists' | 'includes' | 'gt' | 'lt'; value?: unknown }
  | { all: FormaxCondition[] }
  | { any: FormaxCondition[] }
  | { not: FormaxCondition };

export type FormaxOptionLoaderContext<TValues extends FieldValues = FieldValues> = {
  field: SchemaFieldConfig;
  values: TValues;
};

export type FormaxOptionLoader<TValues extends FieldValues = FieldValues> = (
  context: FormaxOptionLoaderContext<TValues>
) => FormaxOption[] | Promise<FormaxOption[]>;

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

const getValueAtPath = (values: FieldValues, path: string) =>
  path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, values);

export function evaluateCondition(condition: FormaxCondition | undefined, values: FieldValues): boolean {
  if (!condition) return true;

  if ('all' in condition) return condition.all.every((item) => evaluateCondition(item, values));
  if ('any' in condition) return condition.any.some((item) => evaluateCondition(item, values));
  if ('not' in condition) return !evaluateCondition(condition.not, values);

  const value = getValueAtPath(values, condition.field);

  switch (condition.op) {
    case 'equals':
      return value === condition.value;
    case 'notEquals':
      return value !== condition.value;
    case 'exists':
      return value !== undefined && value !== null && value !== '';
    case 'includes':
      return Array.isArray(value)
        ? value.includes(condition.value)
        : typeof value === 'string' && typeof condition.value === 'string'
          ? value.includes(condition.value)
          : false;
    case 'gt':
      return Number(value) > Number(condition.value);
    case 'lt':
      return Number(value) < Number(condition.value);
    default:
      return false;
  }
}

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
  if (isKind(unwrapped, 'array', 'ZodArray')) return 'array';
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
  optionLoaders?: Record<string, FormaxOptionLoader<TValues>>;
};

export function SchemaForm<TValues extends FieldValues = FieldValues>({
  config = {},
  optionLoaders,
  schema,
  ...formProps
}: SchemaFormProps<TValues>) {
  const fields = schema ? createFormConfigFromZod(schema, config) : [];

  return (
    <Form<TValues> schema={schema} {...formProps}>
      <SchemaFormContent config={config} fields={fields} optionLoaders={optionLoaders} />
      {!config.steps?.length && <FormActions submitLabel={config.submitLabel} />}
    </Form>
  );
}

export const WorkflowForm = SchemaForm;
export const WorkflowStepper = StepperForm;

function SchemaFormContent<TValues extends FieldValues = FieldValues>({
  config,
  fields,
  optionLoaders,
}: {
  config: SchemaFormConfig;
  fields: SchemaFieldConfig[];
  optionLoaders?: Record<string, FormaxOptionLoader<TValues>>;
}) {
  const methods = useFormContext<TValues>();
  const values = methods.watch();
  const valuesKey = JSON.stringify(values);
  const [loadedOptions, setLoadedOptions] = useState<Record<string, FormaxOption[]>>({});

  useEffect(() => {
    let cancelled = false;
    const fieldsWithLoaders = fields.filter((field) => field.optionSource && optionLoaders?.[field.optionSource]);
    const currentValues = methods.getValues();

    fieldsWithLoaders.forEach((field) => {
      const loader = optionLoaders?.[field.optionSource as string];

      Promise.resolve(loader?.({ field, values: currentValues })).then((options) => {
        if (!cancelled && options) {
          setLoadedOptions((current) => ({ ...current, [field.name]: options }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [fields, methods, optionLoaders, valuesKey]);

  const visibleFields = useMemo(
    () =>
      fields
        .filter((field) => !field.hidden && evaluateCondition(field.visibleWhen, values))
        .map((field) => ({
          ...field,
          disabled: field.disabled || (field.disabledWhen ? evaluateCondition(field.disabledWhen, values) : false),
          options: field.optionSource ? loadedOptions[field.name] || field.options || [] : field.options,
          readOnly: field.readOnly || (field.readOnlyWhen ? evaluateCondition(field.readOnlyWhen, values) : false),
          required: field.required || (field.requiredWhen ? evaluateCondition(field.requiredWhen, values) : false),
        })),
    [fields, loadedOptions, values]
  );
  const unsectionedFields = visibleFields.filter((field) => !field.section);
  const sectionNames = Array.from(new Set(visibleFields.map((field) => field.section).filter(Boolean))) as string[];
  const gridClassName =
    config.layout === 'two-column'
      ? 'formax-grid formax-grid-2'
      : config.layout === 'responsive-grid'
        ? 'formax-grid formax-grid-responsive'
        : 'formax-grid';

  if (config.steps?.length) {
    const fieldsByName = new Map(visibleFields.map((field) => [field.name, field]));

    return (
      <StepperForm
        steps={config.steps.map((step) => ({
          ...step,
          content: (
            <div className={gridClassName}>
              {step.fields
                .map((fieldName) => fieldsByName.get(fieldName))
                .filter(Boolean)
                .map((field) => (
                  <SchemaField key={field?.name} field={field as SchemaFieldConfig} />
                ))}
            </div>
          ),
        }))}
      />
    );
  }

  return (
    <>
      {unsectionedFields.length > 0 && (
        <div className={gridClassName}>
          {unsectionedFields.map((field) => (
            <SchemaField key={field.name} field={field} />
          ))}
        </div>
      )}
      {sectionNames.map((sectionName) => {
        const section = config.sections?.[sectionName];
        const sectionFields = visibleFields.filter((field) => field.section === sectionName);

        return (
          <FormSection
            key={sectionName}
            className={section?.className}
            description={section?.description}
            title={section?.title || labelsFromName(sectionName)}
          >
            <div className={gridClassName}>
              {sectionFields.map((field) => (
                <SchemaField key={field.name} field={field} />
              ))}
            </div>
          </FormSection>
        );
      })}
    </>
  );
}

export function WorkflowSummary({ title = 'Review your answers' }: { title?: string }) {
  const methods = useFormContext();

  return (
    <section className="formax-workflow-summary">
      <h2 className="formax-section-title">{title}</h2>
      <pre>{JSON.stringify(methods.getValues(), null, 2)}</pre>
    </section>
  );
}

function SchemaField({ field }: { field: SchemaFieldConfig }) {
  const common = {
    className: field.className,
    description: field.description,
    disabled: field.disabled,
    label: field.label,
    name: field.name,
    placeholder: field.placeholder,
    readOnly: field.readOnly,
    required: field.required,
  };

  switch (field.component) {
    case 'array':
      return (
        <ArrayField
          {...common}
          defaultItem={field.defaultItem}
          maxItems={field.maxItems}
          minItems={field.minItems}
        >
          {(item) => (
            <TextField
              name={`${item.name}.value`}
              label={`${field.label || labelsFromName(field.name)} ${item.index + 1}`}
            />
          )}
        </ArrayField>
      );
    case 'checkbox':
      return <CheckboxField {...common} disabled={field.disabled || field.readOnly} />;
    case 'date':
      return <DateField {...common} />;
    case 'file':
      return <FileUploadField {...common} disabled={field.disabled || field.readOnly} />;
    case 'multiselect':
      return <MultiSelectField {...common} disabled={field.disabled || field.readOnly} options={field.options || []} />;
    case 'otp':
      return <OtpField {...common} />;
    case 'password':
      return <PasswordField {...common} />;
    case 'phone':
      return <PhoneField {...common} />;
    case 'radio':
      return <RadioGroupField {...common} disabled={field.disabled || field.readOnly} options={field.options || []} />;
    case 'select':
      return <SelectField {...common} disabled={field.disabled || field.readOnly} options={field.options || []} />;
    case 'textarea':
      return <TextareaField {...common} />;
    case 'text':
    default:
      return <TextField {...common} />;
  }
}

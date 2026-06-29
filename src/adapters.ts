import type React from 'react';
import type { FormActionsProps, FormSectionProps } from './workflow/Form';
import type {
  CheckboxFieldProps,
  MultiSelectFieldProps,
  RadioGroupFieldProps,
  SelectFieldProps,
  TextFieldProps,
  TextareaFieldProps,
} from './workflow/fields';
import type { SchemaFieldComponent } from './workflow/schema';

export type FormaxAdapterFieldComponents = Partial<{
  checkbox: React.ComponentType<CheckboxFieldProps>;
  date: React.ComponentType<TextFieldProps>;
  file: React.ComponentType<TextFieldProps>;
  multiselect: React.ComponentType<MultiSelectFieldProps>;
  password: React.ComponentType<TextFieldProps>;
  phone: React.ComponentType<TextFieldProps>;
  radio: React.ComponentType<RadioGroupFieldProps>;
  select: React.ComponentType<SelectFieldProps>;
  text: React.ComponentType<TextFieldProps>;
  textarea: React.ComponentType<TextareaFieldProps>;
}>;

export type FormaxAdapter = {
  actions?: React.ComponentType<FormActionsProps>;
  fields?: FormaxAdapterFieldComponents;
  layout?: {
    fieldClassName?: string;
    formClassName?: string;
    gridClassName?: string;
    section?: React.ComponentType<FormSectionProps>;
  };
  name: string;
  supportedComponents: SchemaFieldComponent[];
};

export function createFormaxAdapter(adapter: FormaxAdapter): FormaxAdapter {
  return adapter;
}

const defaultSupportedComponents: SchemaFieldComponent[] = [
  'array',
  'checkbox',
  'date',
  'file',
  'multiselect',
  'otp',
  'password',
  'phone',
  'radio',
  'select',
  'text',
  'textarea',
];

export const shadcnAdapter = createFormaxAdapter({
  name: 'shadcn',
  supportedComponents: defaultSupportedComponents,
});

export const muiAdapter = createFormaxAdapter({
  name: 'mui',
  supportedComponents: defaultSupportedComponents,
});

export const antDesignAdapter = createFormaxAdapter({
  name: 'ant-design',
  supportedComponents: defaultSupportedComponents,
});

export const mantineAdapter = createFormaxAdapter({
  name: 'mantine',
  supportedComponents: defaultSupportedComponents,
});

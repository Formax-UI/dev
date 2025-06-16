import React, { HTMLInputTypeAttribute, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Base form field props
export interface BaseFieldProps {
  label?: string;
  name: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  helpText?: string;
}

// Text Input props
export interface TextInputProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id'> {
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  register?: any; // React Hook Form register
}

// Textarea props
export interface TextareaProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'id'> {
  placeholder?: string;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  register?: any;
}

// Select option type
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Select props
export interface SelectProps extends BaseFieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name' | 'id'> {
  options: SelectOption[];
  placeholder?: string;
  isSearchable?: boolean;
  isMulti?: boolean;
  isAsync?: boolean;
  loadOptions?: (inputValue: string) => Promise<SelectOption[]>;
  register?: any;
}

// Checkbox props
export interface CheckboxProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'type'> {
  register?: any;
}

// Radio option type
export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Radio Group props
export interface RadioGroupProps extends BaseFieldProps {
  options: RadioOption[];
  direction?: 'horizontal' | 'vertical';
  register?: any;
}

// Switch Toggle props
export interface SwitchToggleProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'type' | 'size'> {
  onLabel?: string;
  offLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  register?: any;
}

// Date Picker props
export interface DatePickerProps extends BaseFieldProps {
  placeholder?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
  value?: Date | null;
  onChange?: (date: Date | null, event?: React.SyntheticEvent<any> | undefined) => void;
  register?: any;
}

// Multi Step Form props
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  validation?: () => Promise<boolean> | boolean;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  onSubmit: (data: any) => void | Promise<void>;
  showProgress?: boolean;
  allowSkipSteps?: boolean;
  className?: string;
}

// Form Error props
export interface FormErrorProps {
  message?: string;
  errors?: string[];
  className?: string;
}

// Submit Button props
export interface SubmitButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'size'> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
}

// Form Provider props
export interface FormProviderProps {
  children: ReactNode;
  formMethods?: any; // React Hook Form methods
  className?: string;
} 
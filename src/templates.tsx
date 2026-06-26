import React from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';
import { SchemaFormConfig, SchemaForm } from './workflow/schema';

export type FormaxTemplate = {
  config: SchemaFormConfig;
  defaultValues: FieldValues;
  description: string;
  ExampleComponent: () => React.ReactElement;
  id: string;
  schema: z.ZodType<FieldValues>;
  title: string;
};

const createTemplate = ({
  config,
  defaultValues,
  description,
  id,
  schema,
  title,
}: Omit<FormaxTemplate, 'ExampleComponent' | 'schema'> & { schema: z.ZodTypeAny }): FormaxTemplate => {
  const typedSchema = schema as z.ZodType<FieldValues>;
  const template = {
    config,
    defaultValues,
    description,
    id,
    schema: typedSchema,
    title,
    ExampleComponent: () => (
      <SchemaForm
        schema={typedSchema}
        defaultValues={defaultValues}
        config={config}
        onSubmit={async () => undefined}
      />
    ),
  };

  return template;
};

export const signupTemplate = createTemplate({
  id: 'signup',
  title: 'Signup',
  description: 'Email and password account creation.',
  schema: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    acceptedTerms: z.boolean().refine(Boolean),
  }),
  defaultValues: { acceptedTerms: false, email: '', password: '' },
  config: {
    submitLabel: 'Create account',
    fields: {
      acceptedTerms: { label: 'I accept the terms', component: 'checkbox' },
    },
  },
});

export const loginTemplate = createTemplate({
  id: 'login',
  title: 'Login',
  description: 'Email and password login.',
  schema: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  defaultValues: { email: '', password: '' },
  config: { submitLabel: 'Sign in' },
});

export const checkoutTemplate = createTemplate({
  id: 'checkout',
  title: 'Checkout',
  description: 'Plan, billing, and payment collection.',
  schema: z.object({
    email: z.string().email(),
    plan: z.enum(['starter', 'pro', 'enterprise']),
    cardholderName: z.string().min(2),
    billingCountry: z.string().min(2),
  }),
  defaultValues: { billingCountry: '', cardholderName: '', email: '', plan: 'starter' },
  config: {
    layout: 'two-column',
    submitLabel: 'Continue to payment',
    sections: {
      account: { title: 'Account' },
      billing: { title: 'Billing' },
    },
    fields: {
      email: { section: 'account' },
      plan: { section: 'account' },
      cardholderName: { section: 'billing', label: 'Cardholder name' },
      billingCountry: { section: 'billing', label: 'Billing country' },
    },
  },
});

export const onboardingTemplate = createTemplate({
  id: 'saas-onboarding',
  title: 'SaaS onboarding',
  description: 'Company setup for B2B SaaS products.',
  schema: z.object({
    companyName: z.string().min(2),
    role: z.enum(['founder', 'ops', 'engineering', 'sales']),
    teamSize: z.enum(['1-5', '6-25', '26-100', '100+']),
    inviteTeam: z.boolean().optional(),
  }),
  defaultValues: { companyName: '', inviteTeam: false, role: 'founder', teamSize: '1-5' },
  config: {
    submitLabel: 'Start onboarding',
    fields: {
      companyName: { label: 'Company name' },
      inviteTeam: { component: 'checkbox', label: 'Invite my team now' },
    },
  },
});

export const adminSettingsTemplate = createTemplate({
  id: 'admin-settings',
  title: 'Admin settings',
  description: 'Workspace settings and notification preferences.',
  schema: z.object({
    workspaceName: z.string().min(2),
    supportEmail: z.string().email(),
    weeklyDigest: z.boolean().optional(),
  }),
  defaultValues: { supportEmail: '', weeklyDigest: true, workspaceName: '' },
  config: {
    submitLabel: 'Save settings',
    fields: {
      weeklyDigest: { component: 'checkbox', label: 'Send weekly digest' },
    },
  },
});

export const invoiceTemplate = createTemplate({
  id: 'invoice',
  title: 'Invoice builder',
  description: 'Client, due date, and repeatable invoice line items.',
  schema: z.object({
    clientEmail: z.string().email(),
    dueDate: z.string().min(1),
    lineItems: z.array(z.object({ value: z.string().min(1) })).min(1),
  }),
  defaultValues: { clientEmail: '', dueDate: '', lineItems: [{ value: '' }] },
  config: {
    submitLabel: 'Create invoice',
    fields: {
      lineItems: {
        component: 'array',
        defaultItem: { value: '' },
        label: 'Line items',
        minItems: 1,
      },
    },
  },
});

export const fileUploadTemplate = createTemplate({
  id: 'file-upload',
  title: 'File upload',
  description: 'Document upload with a short message.',
  schema: z.object({
    document: z.any(),
    message: z.string().optional(),
  }),
  defaultValues: { document: undefined, message: '' },
  config: {
    submitLabel: 'Upload',
    fields: {
      document: { component: 'file', label: 'Document' },
      message: { component: 'textarea', label: 'Message' },
    },
  },
});

export const supportTemplate = createTemplate({
  id: 'support-contact',
  title: 'Support contact',
  description: 'Support request with priority and message.',
  schema: z.object({
    email: z.string().email(),
    priority: z.enum(['low', 'normal', 'urgent']),
    message: z.string().min(10),
  }),
  defaultValues: { email: '', message: '', priority: 'normal' },
  config: {
    submitLabel: 'Send request',
    fields: {
      message: { component: 'textarea' },
    },
  },
});

export const kycTemplate = createTemplate({
  id: 'kyc-profile',
  title: 'KYC profile',
  description: 'Profile information and identity document upload.',
  schema: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    birthDate: z.string().min(1),
    identityDocument: z.any(),
  }),
  defaultValues: { birthDate: '', fullName: '', identityDocument: undefined, phone: '' },
  config: {
    submitLabel: 'Submit profile',
    fields: {
      identityDocument: { component: 'file', label: 'Identity document' },
    },
  },
});

export const formTemplates = [
  signupTemplate,
  loginTemplate,
  checkoutTemplate,
  onboardingTemplate,
  adminSettingsTemplate,
  invoiceTemplate,
  fileUploadTemplate,
  supportTemplate,
  kycTemplate,
];

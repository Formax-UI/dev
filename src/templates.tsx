import React from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';
import { SchemaFormConfig, SchemaFieldConfig, SchemaForm, createFormConfigFromZod } from './workflow/schema';
import { FormaxWorkflowConfig, normalizeFormaxWorkflow } from './studio-core';

export type FormaxTemplate = {
  config: SchemaFormConfig;
  defaultValues: FieldValues;
  description: string;
  ExampleComponent: () => React.ReactElement;
  id: string;
  schema: z.ZodType<FieldValues>;
  studio: {
    category: string;
    prompt: string;
  };
  testCases: string[];
  title: string;
  workflow: FormaxWorkflowConfig;
};

const createTemplate = ({
  category = 'General',
  config,
  defaultValues,
  description,
  id,
  prompt,
  schema,
  testCases,
  title,
}: Omit<FormaxTemplate, 'ExampleComponent' | 'schema' | 'studio' | 'testCases' | 'workflow'> & {
  category?: string;
  prompt?: string;
  schema: z.ZodTypeAny;
  testCases?: string[];
}): FormaxTemplate => {
  const typedSchema = schema as z.ZodType<FieldValues>;
  const inferredFields = createFormConfigFromZod(schema, config).reduce<Record<string, Partial<SchemaFieldConfig>>>(
    (fields, field) => {
      fields[field.name] = field;
      return fields;
    },
    {}
  );
  const workflowConfig = {
    ...config,
    fields: inferredFields,
  };
  const workflow = normalizeFormaxWorkflow({
    config: workflowConfig,
    defaultValues,
    description,
    id,
    name: title,
  });
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
    studio: {
      category,
      prompt: prompt || `Create a ${title.toLowerCase()} form`,
    },
    testCases: testCases || [
      `renders the ${title} template`,
      `validates required ${title} fields`,
      `submits valid ${title} values`,
    ],
    workflow,
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

export const jobApplicationTemplate = createTemplate({
  category: 'Hiring',
  id: 'job-application',
  title: 'Job application',
  description: 'Candidate profile, role, portfolio, and resume upload.',
  schema: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    role: z.enum(['designer', 'engineer', 'product', 'operations']),
    portfolioUrl: z.string().optional(),
    resume: z.any(),
  }),
  defaultValues: { email: '', fullName: '', portfolioUrl: '', resume: undefined, role: 'engineer' },
  config: {
    layout: 'two-column',
    submitLabel: 'Submit application',
    fields: {
      resume: { component: 'file', label: 'Resume' },
      role: { label: 'Role' },
    },
  },
});

export const eventRegistrationTemplate = createTemplate({
  category: 'Events',
  id: 'event-registration',
  title: 'Event registration',
  description: 'Attendee details, ticket type, and dietary notes.',
  schema: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    ticketType: z.enum(['general', 'vip', 'workshop']),
    dietaryNotes: z.string().optional(),
  }),
  defaultValues: { dietaryNotes: '', email: '', fullName: '', ticketType: 'general' },
  config: {
    layout: 'two-column',
    submitLabel: 'Register',
    fields: {
      dietaryNotes: { component: 'textarea', label: 'Dietary notes' },
      ticketType: { label: 'Ticket type' },
    },
  },
});

export const leadQualificationTemplate = createTemplate({
  category: 'Sales',
  id: 'lead-qualification',
  title: 'Lead qualification',
  description: 'Company, budget, timeline, and buying intent capture.',
  schema: z.object({
    companyName: z.string().min(2),
    email: z.string().email(),
    budget: z.enum(['under-10k', '10k-50k', '50k-plus']),
    timeline: z.enum(['now', 'quarter', 'later']),
    notes: z.string().optional(),
  }),
  defaultValues: { budget: '10k-50k', companyName: '', email: '', notes: '', timeline: 'quarter' },
  config: {
    layout: 'responsive-grid',
    submitLabel: 'Qualify lead',
    fields: {
      notes: { component: 'textarea', label: 'Notes' },
    },
  },
});

export const productFeedbackTemplate = createTemplate({
  category: 'Product',
  id: 'product-feedback',
  title: 'Product feedback',
  description: 'Collect product rating, feedback, and follow-up permission.',
  schema: z.object({
    email: z.string().email().optional(),
    rating: z.enum(['1', '2', '3', '4', '5']),
    feedback: z.string().min(10),
    followUp: z.boolean().optional(),
  }),
  defaultValues: { email: '', feedback: '', followUp: false, rating: '5' },
  config: {
    submitLabel: 'Send feedback',
    fields: {
      feedback: { component: 'textarea', label: 'Feedback' },
      followUp: { component: 'checkbox', label: 'May we follow up?' },
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
  jobApplicationTemplate,
  eventRegistrationTemplate,
  leadQualificationTemplate,
  productFeedbackTemplate,
];

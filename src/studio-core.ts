import type { SchemaFieldComponent, SchemaFormConfig } from './workflow/schema';

export type FormaxWorkflowStep = {
  description?: string;
  fields: string[];
  id: string;
  title: string;
};

export type FormaxIntegrationConfig =
  | { type: 'webhook'; method?: 'POST' | 'PUT'; url: string }
  | { type: 'email'; subject: string; to: string }
  | { type: 'file-upload'; provider: 's3' | 'cloudinary' | 'custom' }
  | { type: 'analytics'; provider: 'custom' };

export type FormaxWorkflowConfig = {
  config: SchemaFormConfig;
  defaultValues?: Record<string, unknown>;
  description?: string;
  id: string;
  integrations?: FormaxIntegrationConfig[];
  name: string;
  schema: 'zod';
  steps?: FormaxWorkflowStep[];
};

export type FormaxWorkflowValidationIssue = {
  message: string;
  path: string;
};

export type FormaxWorkflowValidationResult =
  | { errors: []; success: true; workflow: FormaxWorkflowConfig }
  | { errors: FormaxWorkflowValidationIssue[]; success: false };

export type FormaxWorkflowDiff = {
  after?: unknown;
  before?: unknown;
  path: string;
  type: 'added' | 'changed' | 'removed';
};

export type CreateWorkflowFromPromptInput = {
  description?: string;
  name?: string;
  prompt: string;
  submitLabel?: string;
};

export type GenerateReactFormCodeInput = {
  componentName?: string;
  config: FormaxWorkflowConfig | SchemaFormConfig;
  schema?: FormaxWorkflowConfig | SchemaFormConfig | string;
};

const ALLOWED_COMPONENTS = new Set<SchemaFieldComponent>([
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
]);

const UNSAFE_KEYS = new Set([
  '__proto__',
  'constructor',
  'dangerouslySetInnerHTML',
  'onClick',
  'onError',
  'onLoad',
  'prototype',
  'render',
  'script',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const titleFromName = (value: string) =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || 'workflow';

const toPascalCase = (value: string) =>
  titleFromName(value)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') || 'FormaxWorkflow';

const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const getWorkflowConfig = (value: FormaxWorkflowConfig | SchemaFormConfig): SchemaFormConfig =>
  'config' in value && isRecord(value.config) ? value.config : (value as SchemaFormConfig);

const getWorkflow = (value: FormaxWorkflowConfig | SchemaFormConfig): FormaxWorkflowConfig | undefined =>
  'config' in value && isRecord(value.config) ? (value as FormaxWorkflowConfig) : undefined;

const findUnsafeValue = (value: unknown, path = 'workflow'): FormaxWorkflowValidationIssue[] => {
  const issues: FormaxWorkflowValidationIssue[] = [];

  if (typeof value === 'function' || typeof value === 'symbol') {
    return [{ message: 'Functions and symbols are not allowed in Formax workflow JSON.', path }];
  }

  if (typeof value === 'string' && /<\s*script|javascript:/i.test(value)) {
    return [{ message: 'Unsafe script content is not allowed in Formax workflow JSON.', path }];
  }

  if (!isRecord(value) && !Array.isArray(value)) return issues;

  Object.entries(value).forEach(([key, nestedValue]) => {
    const nestedPath = Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`;

    if (UNSAFE_KEYS.has(key)) {
      issues.push({ message: `Unsafe key "${key}" is not allowed.`, path: nestedPath });
    }

    issues.push(...findUnsafeValue(nestedValue, nestedPath));
  });

  return issues;
};

const validateSchemaConfig = (config: unknown): FormaxWorkflowValidationIssue[] => {
  const issues: FormaxWorkflowValidationIssue[] = [];

  if (!isRecord(config)) {
    return [{ message: 'Workflow config must be an object.', path: 'workflow.config' }];
  }

  if (config.layout && !['single', 'two-column', 'responsive-grid'].includes(String(config.layout))) {
    issues.push({ message: 'Workflow config uses an unsupported layout.', path: 'workflow.config.layout' });
  }

  if (!isRecord(config.fields) || Object.keys(config.fields).length === 0) {
    issues.push({ message: 'Workflow config must include at least one field.', path: 'workflow.config.fields' });
    return issues;
  }

  Object.entries(config.fields).forEach(([fieldName, fieldValue]) => {
    if (!isRecord(fieldValue)) {
      issues.push({
        message: `Field "${fieldName}" must be an object.`,
        path: `workflow.config.fields.${fieldName}`,
      });
      return;
    }

    const component = fieldValue.component;
    if (component && !ALLOWED_COMPONENTS.has(component as SchemaFieldComponent)) {
      issues.push({
        message: `Field "${fieldName}" uses unsupported component "${String(component)}".`,
        path: `workflow.config.fields.${fieldName}.component`,
      });
    }

    if (fieldValue.options !== undefined && !Array.isArray(fieldValue.options)) {
      issues.push({
        message: `Field "${fieldName}" options must be an array.`,
        path: `workflow.config.fields.${fieldName}.options`,
      });
    }

    if (Array.isArray(fieldValue.options)) {
      fieldValue.options.forEach((option, index) => {
        if (!isRecord(option) || typeof option.label !== 'string' || typeof option.value !== 'string') {
          issues.push({
            message: `Field "${fieldName}" option ${index + 1} must include string label and value.`,
            path: `workflow.config.fields.${fieldName}.options[${index}]`,
          });
        }
      });
    }
  });

  return issues;
};

export function validateFormaxWorkflow(config: unknown): FormaxWorkflowValidationResult {
  const errors: FormaxWorkflowValidationIssue[] = [];

  if (!isRecord(config)) {
    return { errors: [{ message: 'Workflow must be an object.', path: 'workflow' }], success: false };
  }

  if (typeof config.id !== 'string' || !config.id.trim()) {
    errors.push({ message: 'Workflow id is required.', path: 'workflow.id' });
  }

  if (typeof config.name !== 'string' || !config.name.trim()) {
    errors.push({ message: 'Workflow name is required.', path: 'workflow.name' });
  }

  if (config.schema !== 'zod') {
    errors.push({ message: 'Workflow schema must be "zod".', path: 'workflow.schema' });
  }

  errors.push(...validateSchemaConfig(config.config));
  errors.push(...findUnsafeValue(config));

  if (Array.isArray(config.steps)) {
    config.steps.forEach((step, index) => {
      if (!isRecord(step) || typeof step.id !== 'string' || typeof step.title !== 'string' || !Array.isArray(step.fields)) {
        errors.push({ message: `Step ${index + 1} is invalid.`, path: `workflow.steps[${index}]` });
      }
    });
  }

  if (errors.length > 0) {
    return { errors, success: false };
  }

  return { errors: [], success: true, workflow: config as FormaxWorkflowConfig };
}

export function normalizeFormaxWorkflow(config: Partial<FormaxWorkflowConfig>): FormaxWorkflowConfig {
  const name = config.name?.trim() || 'Untitled workflow';
  const workflow: FormaxWorkflowConfig = {
    config: {
      layout: config.config?.layout || 'single',
      submitLabel: config.config?.submitLabel || 'Submit',
      ...cloneJson(config.config || { fields: {} }),
      fields: cloneJson(config.config?.fields || {}),
      sections: config.config?.sections ? cloneJson(config.config.sections) : undefined,
    },
    defaultValues: cloneJson(config.defaultValues || createDefaultValues(config.config || { fields: {} })),
    description: config.description,
    id: config.id?.trim() || slugify(name),
    integrations: config.integrations ? cloneJson(config.integrations) : undefined,
    name,
    schema: 'zod',
    steps: config.steps ? cloneJson(config.steps) : undefined,
  };
  const result = validateFormaxWorkflow(workflow);

  if (!result.success) {
    throw new Error(result.errors.map((issue) => `${issue.path}: ${issue.message}`).join('\n'));
  }

  return workflow;
}

export function createWorkflowFromPrompt({
  description,
  name,
  prompt,
  submitLabel,
}: CreateWorkflowFromPromptInput): FormaxWorkflowConfig {
  const lowerPrompt = prompt.toLowerCase();
  const isCheckout = /checkout|payment|billing|plan/.test(lowerPrompt);
  const isOnboarding = /onboarding|workspace|company|team/.test(lowerPrompt);
  const isSupport = /support|contact|ticket|help/.test(lowerPrompt);
  const isInvoice = /invoice|line item|client/.test(lowerPrompt);
  const isKyc = /kyc|profile|identity|verification/.test(lowerPrompt);
  const workflowName =
    name ||
    (isCheckout
      ? 'Checkout workflow'
      : isOnboarding
        ? 'SaaS onboarding workflow'
        : isSupport
          ? 'Support request workflow'
          : isInvoice
            ? 'Invoice builder workflow'
            : isKyc
              ? 'KYC profile workflow'
              : 'Signup workflow');

  if (isCheckout) {
    return normalizeFormaxWorkflow({
      description: description || 'Plan, account, and billing collection generated from a prompt.',
      id: slugify(workflowName),
      name: workflowName,
      config: {
        layout: 'two-column',
        submitLabel: submitLabel || 'Continue to payment',
        sections: {
          account: { title: 'Account' },
          billing: { title: 'Billing' },
        },
        fields: {
          email: { component: 'text', label: 'Email', placeholder: 'team@example.com', required: true, section: 'account' },
          plan: {
            component: 'select',
            label: 'Plan',
            options: [
              { label: 'Starter', value: 'starter' },
              { label: 'Pro', value: 'pro' },
              { label: 'Enterprise', value: 'enterprise' },
            ],
            required: true,
            section: 'account',
          },
          cardholderName: { component: 'text', label: 'Cardholder name', required: true, section: 'billing' },
          billingCountry: { component: 'text', label: 'Billing country', required: true, section: 'billing' },
        },
      },
    });
  }

  if (isOnboarding) {
    return normalizeFormaxWorkflow({
      description: description || 'Company setup workflow generated from a prompt.',
      id: slugify(workflowName),
      name: workflowName,
      steps: [
        { fields: ['companyName', 'role'], id: 'company', title: 'Company' },
        { fields: ['teamSize', 'inviteTeam'], id: 'team', title: 'Team' },
      ],
      config: {
        layout: 'two-column',
        submitLabel: submitLabel || 'Start onboarding',
        fields: {
          companyName: { component: 'text', label: 'Company name', required: true },
          role: {
            component: 'select',
            label: 'Your role',
            options: [
              { label: 'Founder', value: 'founder' },
              { label: 'Operations', value: 'ops' },
              { label: 'Engineering', value: 'engineering' },
              { label: 'Sales', value: 'sales' },
            ],
            required: true,
          },
          teamSize: {
            component: 'select',
            label: 'Team size',
            options: [
              { label: '1-5', value: '1-5' },
              { label: '6-25', value: '6-25' },
              { label: '26-100', value: '26-100' },
              { label: '100+', value: '100+' },
            ],
            required: true,
          },
          inviteTeam: { component: 'checkbox', label: 'Invite my team now' },
        },
      },
    });
  }

  if (isSupport) {
    return normalizeFormaxWorkflow({
      description: description || 'Support request workflow generated from a prompt.',
      id: slugify(workflowName),
      name: workflowName,
      config: {
        submitLabel: submitLabel || 'Send request',
        fields: {
          email: { component: 'text', label: 'Email', required: true },
          priority: {
            component: 'select',
            label: 'Priority',
            options: [
              { label: 'Low', value: 'low' },
              { label: 'Normal', value: 'normal' },
              { label: 'Urgent', value: 'urgent' },
            ],
            required: true,
          },
          message: { component: 'textarea', label: 'Message', placeholder: 'How can we help?', required: true },
        },
      },
    });
  }

  if (isInvoice) {
    return normalizeFormaxWorkflow({
      description: description || 'Invoice builder generated from a prompt.',
      id: slugify(workflowName),
      name: workflowName,
      config: {
        submitLabel: submitLabel || 'Create invoice',
        fields: {
          clientEmail: { component: 'text', label: 'Client email', required: true },
          dueDate: { component: 'date', label: 'Due date', required: true },
          lineItems: {
            component: 'array',
            defaultItem: { value: '' },
            label: 'Line items',
            minItems: 1,
            required: true,
          },
        },
      },
    });
  }

  if (isKyc) {
    return normalizeFormaxWorkflow({
      description: description || 'KYC profile workflow generated from a prompt.',
      id: slugify(workflowName),
      name: workflowName,
      config: {
        layout: 'two-column',
        submitLabel: submitLabel || 'Submit profile',
        fields: {
          fullName: { component: 'text', label: 'Full name', required: true },
          phone: { component: 'phone', label: 'Phone', required: true },
          birthDate: { component: 'date', label: 'Birth date', required: true },
          identityDocument: { component: 'file', label: 'Identity document', required: true },
        },
      },
    });
  }

  return normalizeFormaxWorkflow({
    description: description || 'Signup workflow generated from a prompt.',
    id: slugify(workflowName),
    name: workflowName,
    config: {
      submitLabel: submitLabel || 'Create account',
      fields: {
        email: { component: 'text', label: 'Email', placeholder: 'team@example.com', required: true },
        password: { component: 'password', label: 'Password', required: true },
        acceptedTerms: { component: 'checkbox', label: 'I accept the terms', required: true },
      },
    },
  });
}

export function generateConfigJson(config: FormaxWorkflowConfig | SchemaFormConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

export function generateZodSchemaCode(input: FormaxWorkflowConfig | SchemaFormConfig): string {
  const config = getWorkflowConfig(input);
  const fields = Object.entries(config.fields || {});
  const lines = fields.map(([name, field]) => `  ${name}: ${zodExpressionForField(name, field)},`);

  return `import { z } from 'zod';

export const schema = z.object({
${lines.join('\n')}
});

export type FormValues = z.infer<typeof schema>;
`;
}

export function generateReactFormCode({
  componentName,
  config,
  schema,
}: GenerateReactFormCodeInput): string {
  const workflow = getWorkflow(config);
  const schemaCode = typeof schema === 'string' ? schema : generateZodSchemaCode(schema || config);
  const schemaBody = schemaCode
    .replace("import { z } from 'zod';\n\n", '')
    .replace(/\nexport type FormValues = z\.infer<typeof schema>;\n?/, '');
  const formConfig = getWorkflowConfig(config);
  const defaultValues = workflow?.defaultValues || createDefaultValues(formConfig);
  const resolvedComponentName = componentName || `${toPascalCase(workflow?.name || 'Generated')}Form`;

  return `import { z } from 'zod';
import { SchemaForm } from 'formax-ui/workflow';
import 'formax-ui/styles.css';

${schemaBody}
const config = ${JSON.stringify(formConfig, null, 2)} as const;
const defaultValues = ${JSON.stringify(defaultValues, null, 2)} as const;

export function ${resolvedComponentName}() {
  return (
    <SchemaForm
      schema={schema}
      config={config}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        console.log(values);
      }}
    />
  );
}
`;
}

export function diffWorkflowConfigs(
  before: FormaxWorkflowConfig | SchemaFormConfig,
  after: FormaxWorkflowConfig | SchemaFormConfig
): FormaxWorkflowDiff[] {
  const diffs: FormaxWorkflowDiff[] = [];

  collectDiffs(before, after, 'workflow', diffs);

  return diffs;
}

function collectDiffs(before: unknown, after: unknown, path: string, diffs: FormaxWorkflowDiff[]) {
  if (JSON.stringify(before) === JSON.stringify(after)) return;

  if (before === undefined) {
    diffs.push({ after, path, type: 'added' });
    return;
  }

  if (after === undefined) {
    diffs.push({ before, path, type: 'removed' });
    return;
  }

  if (!isRecord(before) || !isRecord(after)) {
    diffs.push({ after, before, path, type: 'changed' });
    return;
  }

  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  keys.forEach((key) => collectDiffs(before[key], after[key], `${path}.${key}`, diffs));
}

function zodExpressionForField(name: string, field: Partial<{ component: SchemaFieldComponent; options: Array<{ value: string }>; required: boolean }>) {
  const component = field.component || inferComponentFromName(name);
  const optional = field.required === false ? '.optional()' : '';

  if ((component === 'select' || component === 'radio') && field.options?.length) {
    const values = field.options.map((option) => JSON.stringify(option.value)).join(', ');
    return `z.enum([${values}])${optional}`;
  }

  if (component === 'checkbox') return `z.boolean()${optional}`;
  if (component === 'array') return `z.array(z.object({ value: z.string().min(1) }))${optional}`;
  if (component === 'file') return `z.any()${optional}`;
  if (component === 'date') return `z.string().min(1, 'Choose a date')${optional}`;
  if (component === 'phone') return `z.string().min(6, 'Enter a valid phone number')${optional}`;
  if (component === 'password') return `z.string().min(8, 'Use at least 8 characters')${optional}`;
  if (name.toLowerCase().includes('email')) return `z.string().email('Enter a valid email')${optional}`;

  return `z.string().min(1, 'Required')${optional}`;
}

function inferComponentFromName(name: string): SchemaFieldComponent {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('password')) return 'password';
  if (lowerName.includes('phone') || lowerName.includes('mobile')) return 'phone';
  if (lowerName.includes('date')) return 'date';
  if (lowerName.includes('message')) return 'textarea';

  return 'text';
}

function createDefaultValues(config: SchemaFormConfig): Record<string, unknown> {
  return Object.entries(config.fields || {}).reduce<Record<string, unknown>>((values, [name, field]) => {
    switch (field.component || inferComponentFromName(name)) {
      case 'array':
        values[name] = field.defaultItem ? [field.defaultItem] : [];
        break;
      case 'checkbox':
        values[name] = false;
        break;
      case 'multiselect':
        values[name] = [];
        break;
      case 'select':
      case 'radio':
        values[name] = field.options?.[0]?.value || '';
        break;
      default:
        values[name] = '';
    }

    return values;
  }, {});
}

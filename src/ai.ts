import { SchemaFieldComponent, SchemaFormConfig } from './workflow/schema';
import {
  FormaxWorkflowConfig,
  createWorkflowFromPrompt,
  normalizeFormaxWorkflow,
  validateFormaxWorkflow,
} from './studio-core';

export type FormaxAIGenerateInput = {
  audience?: string;
  prompt: string;
  submitLabel?: string;
};

export type FormaxAIProvider = {
  generateConfig(input: FormaxAIGenerateInput): Promise<unknown>;
};

export type FormaxAIProviderOptions = {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
  model?: string;
};

export type DeepSeekFormAssistantOptions = FormaxAIProviderOptions;
export type GenerateFormConfigInput = FormaxAIGenerateInput;
export type FormaxAIImproveWorkflowInput = {
  instruction: string;
  workflow: FormaxWorkflowConfig;
};

export type FormaxAIGenerateCopyInput = {
  tone?: 'friendly' | 'professional' | 'direct';
  workflow: FormaxWorkflowConfig;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type AnthropicResponse = {
  content?: Array<{
    text?: string;
    type?: string;
  }>;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
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

const SYSTEM_PROMPT = `You generate JSON config for Formax UI SchemaForm.
Return JSON only. Do not return markdown.
The JSON shape is:
{
  "layout": "single" | "two-column",
  "submitLabel": string,
  "fields": {
    "fieldName": {
      "label": string,
      "description": string,
      "placeholder": string,
      "component": "array" | "text" | "password" | "textarea" | "select" | "multiselect" | "checkbox" | "radio" | "date" | "file" | "otp" | "phone",
      "required": boolean,
      "section": string,
      "optionSource": string,
      "options": [{ "label": string, "value": string }]
    }
  }
}`;

const buildUserPrompt = (input: FormaxAIGenerateInput) =>
  [
    input.prompt,
    input.audience ? `Audience: ${input.audience}` : '',
    input.submitLabel ? `Preferred submit label: ${input.submitLabel}` : '',
  ]
    .filter(Boolean)
    .join('\n');

const parseJsonConfig = (content: string): unknown => {
  const trimmed = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
  return JSON.parse(trimmed);
};

const assertPlainObject = (value: unknown, message: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(message);
  }

  return value as Record<string, unknown>;
};

export function validateFormConfig(config: unknown): SchemaFormConfig {
  const root = assertPlainObject(config, 'AI returned an invalid Formax config.');
  const fields = assertPlainObject(root.fields, 'AI returned a config without fields.');

  if (root.layout && root.layout !== 'single' && root.layout !== 'two-column' && root.layout !== 'responsive-grid') {
    throw new Error('AI returned an unsupported layout.');
  }

  Object.entries(fields).forEach(([name, value]) => {
    const field = assertPlainObject(value, `AI returned an invalid field config for "${name}".`);
    const component = field.component as SchemaFieldComponent | undefined;

    if (component && !ALLOWED_COMPONENTS.has(component)) {
      throw new Error(`AI returned unsupported component "${component}".`);
    }

    if (field.options !== undefined) {
      if (!Array.isArray(field.options)) {
        throw new Error(`AI returned invalid options for "${name}".`);
      }

      field.options.forEach((option) => {
        const parsedOption = assertPlainObject(option, `AI returned invalid option for "${name}".`);

        if (typeof parsedOption.label !== 'string' || typeof parsedOption.value !== 'string') {
          throw new Error(`AI returned option without string label/value for "${name}".`);
        }
      });
    }
  });

  return root as SchemaFormConfig;
}

export function createFormAssistant({ provider }: { provider: FormaxAIProvider }) {
  return {
    async generateConfig(input: FormaxAIGenerateInput): Promise<SchemaFormConfig> {
      return validateFormConfig(await provider.generateConfig(input));
    },
    async generateWorkflow(input: FormaxAIGenerateInput): Promise<FormaxWorkflowConfig> {
      const output = await provider.generateConfig(input);

      if (output && typeof output === 'object' && 'config' in output) {
        const result = validateFormaxWorkflow(output);

        if (!result.success) {
          throw new Error(result.errors.map((issue) => `${issue.path}: ${issue.message}`).join('\n'));
        }

        return result.workflow;
      }

      return normalizeFormaxWorkflow({
        config: validateFormConfig(output),
        description: `Generated from prompt: ${input.prompt}`,
        name: input.prompt.slice(0, 72) || 'Generated workflow',
      });
    },
    async improveWorkflow({ instruction, workflow }: FormaxAIImproveWorkflowInput): Promise<FormaxWorkflowConfig> {
      const output = await provider.generateConfig({
        prompt: `${instruction}\n\nCurrent workflow JSON:\n${JSON.stringify(workflow, null, 2)}`,
      });
      const candidate =
        output && typeof output === 'object' && 'config' in output
          ? output
          : {
              ...workflow,
              config: validateFormConfig(output),
              description: workflow.description,
              id: workflow.id,
              name: workflow.name,
            };
      const result = validateFormaxWorkflow(candidate);

      if (!result.success) {
        throw new Error(result.errors.map((issue) => `${issue.path}: ${issue.message}`).join('\n'));
      }

      return result.workflow;
    },
    explainWorkflow(workflow: FormaxWorkflowConfig): string {
      const fieldCount = Object.keys(workflow.config.fields || {}).length;
      const sectionCount = Object.keys(workflow.config.sections || {}).length;
      const stepCount = workflow.steps?.length || 0;

      return `${workflow.name} is a ${fieldCount}-field Formax workflow${
        sectionCount ? ` organized into ${sectionCount} sections` : ''
      }${stepCount ? ` and ${stepCount} steps` : ''}. It uses Zod validation and renders with SchemaForm or WorkflowForm.`;
    },
    generateTestCases(workflow: FormaxWorkflowConfig): string[] {
      const fields = Object.keys(workflow.config.fields || {});

      return [
        `renders ${workflow.name} with ${fields.length} fields`,
        'shows validation errors on invalid submit',
        'submits valid values through the onSubmit handler',
        ...(workflow.steps?.length ? ['moves forward and backward through workflow steps'] : []),
        ...(fields.some((field) => workflow.config.fields?.[field]?.visibleWhen)
          ? ['applies conditional visibility rules']
          : []),
      ];
    },
    generateCopy({ tone = 'professional', workflow }: FormaxAIGenerateCopyInput) {
      const adjective = tone === 'friendly' ? 'simple' : tone === 'direct' ? 'fast' : 'production-ready';

      return {
        description: workflow.description || `${workflow.name} generated with Formax UI.`,
        headline: `${workflow.name}`,
        submitLabel: workflow.config.submitLabel || 'Submit',
        summary: `A ${adjective} form workflow with validated fields, accessible UI, and copyable React output.`,
      };
    },
    createWorkflowFromPrompt,
  };
}

const requireApiKey = (apiKey: string, providerName: string) => {
  if (!apiKey) {
    throw new Error(`${providerName} API key is required. Use AI helpers only from server-side code.`);
  }
};

export function deepSeekProvider({
  apiKey,
  baseUrl = 'https://api.deepseek.com/chat/completions',
  fetcher = fetch,
  model = 'deepseek-chat',
}: FormaxAIProviderOptions): FormaxAIProvider {
  requireApiKey(apiKey, 'DeepSeek');

  return {
    async generateConfig(input) {
      const response = await fetcher(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(input) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek request failed with status ${response.status}.`);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('DeepSeek returned an empty response.');
      }

      return parseJsonConfig(content);
    },
  };
}

export function openAIProvider({
  apiKey,
  baseUrl = 'https://api.openai.com/v1/chat/completions',
  fetcher = fetch,
  model = 'gpt-4.1-mini',
}: FormaxAIProviderOptions): FormaxAIProvider {
  requireApiKey(apiKey, 'OpenAI');

  return {
    async generateConfig(input) {
      const response = await fetcher(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(input) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}.`);

      const data = (await response.json()) as ChatCompletionResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error('OpenAI returned an empty response.');
      return parseJsonConfig(content);
    },
  };
}

export function anthropicProvider({
  apiKey,
  baseUrl = 'https://api.anthropic.com/v1/messages',
  fetcher = fetch,
  model = 'claude-sonnet-4-20250514',
}: FormaxAIProviderOptions): FormaxAIProvider {
  requireApiKey(apiKey, 'Anthropic');

  return {
    async generateConfig(input) {
      const response = await fetcher(baseUrl, {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          max_tokens: 2000,
          model,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildUserPrompt(input) }],
          temperature: 0.2,
        }),
      });

      if (!response.ok) throw new Error(`Anthropic request failed with status ${response.status}.`);

      const data = (await response.json()) as AnthropicResponse;
      const content = data.content?.find((part) => part.type === 'text' || part.text)?.text;

      if (!content) throw new Error('Anthropic returned an empty response.');
      return parseJsonConfig(content);
    },
  };
}

export function geminiProvider({
  apiKey,
  baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models',
  fetcher = fetch,
  model = 'gemini-2.5-flash',
}: FormaxAIProviderOptions): FormaxAIProvider {
  requireApiKey(apiKey, 'Gemini');

  return {
    async generateConfig(input) {
      const response = await fetcher(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(input)}` }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}.`);

      const data = (await response.json()) as GeminiResponse;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) throw new Error('Gemini returned an empty response.');
      return parseJsonConfig(content);
    },
  };
}

export function vercelAIProvider(provider: FormaxAIProvider): FormaxAIProvider {
  return provider;
}

export function createDeepSeekFormAssistant(options: DeepSeekFormAssistantOptions) {
  return createFormAssistant({ provider: deepSeekProvider(options) });
}

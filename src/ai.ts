import { SchemaFormConfig } from './workflow/schema';

export type DeepSeekFormAssistantOptions = {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
  model?: string;
};

export type GenerateFormConfigInput = {
  audience?: string;
  prompt: string;
  submitLabel?: string;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const DEFAULT_BASE_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';

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
      "component": "text" | "password" | "textarea" | "select" | "multiselect" | "checkbox" | "radio" | "date" | "file" | "otp" | "phone",
      "required": boolean,
      "options": [{ "label": string, "value": string }]
    }
  }
}`;

function parseJsonConfig(content: string): SchemaFormConfig {
  const trimmed = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
  const parsed = JSON.parse(trimmed) as SchemaFormConfig;

  if (!parsed || typeof parsed !== 'object' || !parsed.fields || typeof parsed.fields !== 'object') {
    throw new Error('DeepSeek returned an invalid Formax config.');
  }

  return parsed;
}

export function createDeepSeekFormAssistant({
  apiKey,
  baseUrl = DEFAULT_BASE_URL,
  fetcher = fetch,
  model = DEFAULT_MODEL,
}: DeepSeekFormAssistantOptions) {
  if (!apiKey) {
    throw new Error('A DeepSeek API key is required. Use this helper only from server-side code.');
  }

  return {
    async generateConfig(input: GenerateFormConfigInput): Promise<SchemaFormConfig> {
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
            {
              role: 'user',
              content: [
                input.prompt,
                input.audience ? `Audience: ${input.audience}` : '',
                input.submitLabel ? `Preferred submit label: ${input.submitLabel}` : '',
              ]
                .filter(Boolean)
                .join('\n'),
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek request failed with status ${response.status}.`);
      }

      const data = (await response.json()) as DeepSeekResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('DeepSeek returned an empty response.');
      }

      return parseJsonConfig(content);
    },
  };
}

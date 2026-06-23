import { describe, expect, it, vi } from 'vitest';
import { createDeepSeekFormAssistant } from '../ai';

describe('createDeepSeekFormAssistant', () => {
  it('parses DeepSeek JSON form config responses', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                layout: 'two-column',
                submitLabel: 'Start onboarding',
                fields: {
                  companyName: {
                    component: 'text',
                    label: 'Company name',
                    required: true,
                  },
                },
              }),
            },
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const assistant = createDeepSeekFormAssistant({ apiKey: 'test-key', fetcher });
    const config = await assistant.generateConfig({ prompt: 'Create a SaaS onboarding form' });

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.deepseek.com/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
      })
    );
    expect(config.fields?.companyName?.label).toBe('Company name');
  });

  it('requires server-side DeepSeek credentials', () => {
    expect(() => createDeepSeekFormAssistant({ apiKey: '' })).toThrow('DeepSeek API key');
  });
});

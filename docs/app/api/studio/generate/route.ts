import { createWorkflowFromPrompt, validateFormaxWorkflow } from 'formax-ui/studio-core';

export async function POST(request: Request) {
  const { prompt } = (await request.json()) as { prompt?: string };
  const workflow = createWorkflowFromPrompt({
    prompt: prompt || 'Create a SaaS signup workflow',
  });
  const result = validateFormaxWorkflow(workflow);

  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 422 });
  }

  return Response.json(result.workflow);
}

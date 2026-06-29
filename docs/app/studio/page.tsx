'use client';

import {
    Check,
    Code2,
    Copy,
    Download,
    Eye,
    FileJson,
    LayoutTemplate,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    createWorkflowFromPrompt,
    generateConfigJson,
    generateReactFormCode,
    generateZodSchemaCode,
    normalizeFormaxWorkflow,
    type FormaxWorkflowConfig,
} from 'formax-ui/studio-core';
import { SchemaForm, type SchemaFieldConfig } from 'formax-ui/workflow';
import { formTemplates } from 'formax-ui/templates';
import { z } from 'zod';
import 'formax-ui/styles.css';

type ExportTab = 'react' | 'schema' | 'json';

const templateWorkflows = formTemplates.map((template) => template.workflow);

const defaultWorkflow = templateWorkflows.find((template) => template.id === 'saas-onboarding') || templateWorkflows[0]!;

const operators = ['equals', 'notEquals', 'exists', 'includes', 'gt', 'lt'] as const;

function fieldSchema(name: string, field: Partial<SchemaFieldConfig>) {
    const optional = field.required === false;
    const component = field.component || 'text';
    let schema: z.ZodTypeAny;

    if ((component === 'select' || component === 'radio') && field.options?.length) {
        schema = z.enum(field.options.map((option) => option.value) as [string, ...string[]]);
    } else if (component === 'checkbox') {
        schema = z.boolean();
    } else if (component === 'array') {
        schema = z.array(z.object({ value: z.string().min(1) }));
    } else if (component === 'file') {
        schema = z.any();
    } else if (component === 'password') {
        schema = z.string().min(8);
    } else if (component === 'phone') {
        schema = z.string().min(6);
    } else if (name.toLowerCase().includes('email')) {
        schema = z.string().email();
    } else {
        schema = z.string().min(field.required ? 1 : 0);
    }

    return optional ? schema.optional() : schema;
}

function schemaFromWorkflow(workflow: FormaxWorkflowConfig) {
    const shape = Object.entries(workflow.config.fields || {}).reduce<Record<string, z.ZodTypeAny>>(
        (fields, [name, field]) => {
            fields[name] = fieldSchema(name, field);
            return fields;
        },
        {}
    );

    return z.object(shape);
}

function updateWorkflowField(
    workflow: FormaxWorkflowConfig,
    fieldName: string,
    update: Partial<SchemaFieldConfig>
): FormaxWorkflowConfig {
    return normalizeFormaxWorkflow({
        ...workflow,
        config: {
            ...workflow.config,
            fields: {
                ...workflow.config.fields,
                [fieldName]: {
                    ...workflow.config.fields?.[fieldName],
                    ...update,
                },
            },
        },
    });
}

function downloadText(filename: string, text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

export default function StudioPage() {
    const [workflow, setWorkflow] = useState<FormaxWorkflowConfig>(defaultWorkflow);
    const [prompt, setPrompt] = useState('Create a SaaS onboarding form with company, role, team size, and invite fields');
    const [activeField, setActiveField] = useState(Object.keys(defaultWorkflow.config.fields || {})[0] || '');
    const [activeTab, setActiveTab] = useState<ExportTab>('react');
    const [copied, setCopied] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [jsonDraft, setJsonDraft] = useState(generateConfigJson(defaultWorkflow.config));
    const [stepsDraft, setStepsDraft] = useState(JSON.stringify(defaultWorkflow.steps || [], null, 2));

    const previewSchema = useMemo(() => schemaFromWorkflow(workflow), [workflow]);
    const fieldNames = Object.keys(workflow.config.fields || {});
    const selectedField = workflow.config.fields?.[activeField] || {};
    const reactCode = useMemo(() => generateReactFormCode({ config: workflow, schema: workflow }), [workflow]);
    const schemaCode = useMemo(() => generateZodSchemaCode(workflow), [workflow]);
    const configJson = useMemo(() => generateConfigJson(workflow), [workflow]);
    const exportText = activeTab === 'react' ? reactCode : activeTab === 'schema' ? schemaCode : configJson;
    const visibleWhen =
        selectedField.visibleWhen && 'field' in selectedField.visibleWhen ? selectedField.visibleWhen : undefined;

    const copyText = async (key: string, text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        window.setTimeout(() => setCopied(null), 1200);
    };

    const generateFromPrompt = async () => {
        setIsGenerating(true);

        try {
            const response = await fetch('/api/studio/generate', {
                body: JSON.stringify({ prompt }),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            });
            const nextWorkflow = response.ok
                ? ((await response.json()) as FormaxWorkflowConfig)
                : createWorkflowFromPrompt({ prompt });

            setWorkflow(nextWorkflow);
            setActiveField(Object.keys(nextWorkflow.config.fields || {})[0] || '');
            setJsonDraft(generateConfigJson(nextWorkflow.config));
            setStepsDraft(JSON.stringify(nextWorkflow.steps || [], null, 2));
        } finally {
            setIsGenerating(false);
        }
    };

    const updateField = (update: Partial<SchemaFieldConfig>) => {
        const nextWorkflow = updateWorkflowField(workflow, activeField, update);
        setWorkflow(nextWorkflow);
        setJsonDraft(generateConfigJson(nextWorkflow.config));
    };

    const applyConfigJson = () => {
        const parsed = JSON.parse(jsonDraft);
        const nextWorkflow = normalizeFormaxWorkflow({ ...workflow, config: parsed });
        setWorkflow(nextWorkflow);
        setActiveField(Object.keys(nextWorkflow.config.fields || {})[0] || '');
    };

    const applyStepsJson = () => {
        const parsed = JSON.parse(stepsDraft);
        const nextWorkflow = normalizeFormaxWorkflow({ ...workflow, steps: parsed });
        setWorkflow(nextWorkflow);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-formax-600">Formax Studio</p>
                            <h1 className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">
                                AI-ready form workflow builder
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                                onClick={() => copyText('json', configJson)}
                            >
                                {copied === 'json' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                Copy JSON
                            </button>
                            <button
                                type="button"
                                className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
                                onClick={() => downloadText(`${workflow.id}.tsx`, reactCode)}
                            >
                                <Download className="h-4 w-4" />
                                Download React
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Prompt</span>
                            <textarea
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                className="min-h-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 shadow-sm outline-none focus:border-formax-500 focus:ring-2 focus:ring-formax-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                            />
                        </label>
                        <button
                            type="button"
                            className="btn-primary mt-auto inline-flex h-11 items-center justify-center gap-2 px-5 text-sm"
                            onClick={generateFromPrompt}
                            disabled={isGenerating}
                        >
                            <Sparkles className="h-4 w-4" />
                            {isGenerating ? 'Generating' : 'Generate'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:px-8">
                <aside className="grid content-start gap-4">
                    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <LayoutTemplate className="h-4 w-4 text-formax-600" />
                            Templates
                        </div>
                        <div className="grid gap-2">
                            {templateWorkflows.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                                        workflow.id === template.id
                                            ? 'border-formax-500 bg-formax-50 text-formax-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-formax-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200'
                                    }`}
                                    onClick={() => {
                                        setWorkflow(template);
                                        setActiveField(Object.keys(template.config.fields || {})[0] || '');
                                        setJsonDraft(generateConfigJson(template.config));
                                        setStepsDraft(JSON.stringify(template.steps || [], null, 2));
                                    }}
                                >
                                    <span className="block font-medium">{template.name}</span>
                                    <span className="mt-1 block text-xs text-gray-500">{template.description}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <FileJson className="h-4 w-4 text-formax-600" />
                            Fields
                        </div>
                        <div className="grid gap-2">
                            {fieldNames.map((fieldName) => (
                                <button
                                    key={fieldName}
                                    type="button"
                                    data-testid={`studio-field-${fieldName}`}
                                    className={`rounded-md px-3 py-2 text-left text-sm ${
                                        activeField === fieldName
                                            ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                                    onClick={() => setActiveField(fieldName)}
                                >
                                    {workflow.config.fields?.[fieldName]?.label || fieldName}
                                </button>
                            ))}
                        </div>
                    </section>
                </aside>

                <main className="grid content-start gap-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <Eye className="h-4 w-4 text-formax-600" />
                            Live preview
                        </div>
                        <SchemaForm
                            schema={previewSchema}
                            config={workflow.config}
                            defaultValues={workflow.defaultValues}
                            onSubmit={async () => undefined}
                        />
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <Code2 className="h-4 w-4 text-formax-600" />
                            Exports
                        </div>
                        <div className="mb-3 flex flex-wrap gap-2">
                            {(['react', 'schema', 'json'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                                        activeTab === tab
                                            ? 'bg-formax-600 text-white'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'react' ? 'React' : tab === 'schema' ? 'Zod' : 'JSON'}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="ml-auto inline-flex items-center gap-2 rounded-md bg-gray-950 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-950"
                                onClick={() => copyText(activeTab, exportText)}
                            >
                                {copied === activeTab ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                Copy
                            </button>
                        </div>
                        <pre className="max-h-[520px] overflow-auto rounded-lg bg-gray-950 p-4 text-xs leading-relaxed text-gray-100">
                            <code>{exportText}</code>
                        </pre>
                    </section>
                </main>

                <aside className="grid content-start gap-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Field editor</div>
                        <div className="grid gap-3">
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Label</span>
                                <input
                                    value={String(selectedField.label || '')}
                                    onChange={(event) => updateField({ label: event.target.value })}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                                />
                            </label>
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Placeholder</span>
                                <input
                                    value={String(selectedField.placeholder || '')}
                                    onChange={(event) => updateField({ placeholder: event.target.value })}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                                />
                            </label>
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Description</span>
                                <textarea
                                    value={String(selectedField.description || '')}
                                    onChange={(event) => updateField({ description: event.target.value })}
                                    className="min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                                />
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={Boolean(selectedField.required)}
                                    onChange={(event) => updateField({ required: event.target.checked })}
                                />
                                Required
                            </label>
                            <label className="grid gap-1 text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Visible when field</span>
                                <select
                                    value={visibleWhen ? String(visibleWhen.field) : ''}
                                    onChange={(event) =>
                                        updateField({
                                            visibleWhen: event.target.value
                                                ? { field: event.target.value, op: 'equals', value: '' }
                                                : undefined,
                                        })
                                    }
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                                >
                                    <option value="">Always visible</option>
                                    {fieldNames.filter((name) => name !== activeField).map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            {visibleWhen && (
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={visibleWhen.op || 'equals'}
                                        onChange={(event) =>
                                            updateField({
                                                visibleWhen: {
                                                    field: visibleWhen.field || '',
                                                    op: event.target.value as (typeof operators)[number],
                                                    value: visibleWhen.value,
                                                },
                                            })
                                        }
                                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                                    >
                                        {operators.map((operator) => (
                                            <option key={operator} value={operator}>
                                                {operator}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        value={String(visibleWhen.value || '')}
                                        onChange={(event) =>
                                            updateField({
                                                visibleWhen: {
                                                    field: visibleWhen.field || '',
                                                    op: visibleWhen.op || 'equals',
                                                    value: event.target.value,
                                                },
                                            })
                                        }
                                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Config JSON</div>
                        <textarea
                            value={jsonDraft}
                            onChange={(event) => setJsonDraft(event.target.value)}
                            className="h-44 w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-xs dark:border-gray-700 dark:bg-gray-950"
                        />
                        <button type="button" className="btn-secondary mt-3 px-4 py-2 text-sm" onClick={applyConfigJson}>
                            Apply config
                        </button>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Steps JSON</div>
                        <textarea
                            value={stepsDraft}
                            onChange={(event) => setStepsDraft(event.target.value)}
                            className="h-32 w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-xs dark:border-gray-700 dark:bg-gray-950"
                        />
                        <button type="button" className="btn-secondary mt-3 px-4 py-2 text-sm" onClick={applyStepsJson}>
                            Apply steps
                        </button>
                    </section>
                </aside>
            </div>
        </div>
    );
}

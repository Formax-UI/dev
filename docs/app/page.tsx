'use client';

import { Form, FormActions, TextField } from 'formax-ui';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle,
    Code,
    Download,
    GitFork,
    Palette,
    Shield,
    Smartphone,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

const features = [
    {
        icon: Zap,
        title: 'Workflow-Focused',
        description: 'Built around complete React Hook Form and Zod workflows, not just isolated inputs.',
        color: 'text-yellow-600'
    },
    {
        icon: Shield,
        title: 'Accessible',
        description: 'Built with ARIA standards and keyboard navigation for everyone.',
        color: 'text-green-600'
    },
    {
        icon: Palette,
        title: 'Beautiful Design',
        description: 'CSS-variable styling that works without requiring Tailwind in consumer apps.',
        color: 'text-purple-600'
    },
    {
        icon: Code,
        title: 'TypeScript Ready',
        description: 'Full TypeScript support with comprehensive type definitions.',
        color: 'text-blue-600'
    },
    {
        icon: Smartphone,
        title: 'Mobile First',
        description: 'Responsive design that works perfectly on all devices.',
        color: 'text-pink-600'
    },
    {
        icon: Users,
        title: 'Developer Friendly',
        description: 'Typed field components, schema forms, and optional DeepSeek-assisted config generation.',
        color: 'text-indigo-600'
    }
];

const stats = [
    { label: 'Workflow APIs', value: '9+' },
    { label: 'Field Components', value: '14+' },
    { label: 'Styling', value: 'CSS vars' },
    { label: 'Automation', value: 'CI ready' }
];

const contactSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="hero-gradient">
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            {/* Logo */}
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                        <rect width="40" height="40" rx="10" fill="white" opacity="0.9" />
                                        <rect x="8" y="10" width="24" height="4" rx="2" fill="#0ea5e9" opacity="0.8" />
                                        <rect x="8" y="17" width="18" height="4" rx="2" fill="#0ea5e9" opacity="0.6" />
                                        <rect x="8" y="24" width="6" height="6" rx="2" fill="#0ea5e9" opacity="0.8" />
                                        <path d="M10 26.5L11.5 28L13.5 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <rect x="8" y="32" width="16" height="6" rx="3" fill="#0ea5e9" opacity="0.7" />
                                    </svg>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                                Formax <span className="text-blue-200">UI</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto text-balance">
                                Production-ready React form workflows for React Hook Form, Zod, and modern dashboards
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Link href="/docs/getting-started" className="btn-primary bg-white text-formax-600 hover:bg-gray-50">
                                    Get Started
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                                <Link href="/playground" className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    View Examples
                                </Link>
                            </div>

                            {/* Quick install */}
                            <div className="max-w-lg mx-auto">
                                <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 text-left">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-200 text-sm font-medium">Quick Install</span>
                                        <button className="text-blue-200 hover:text-white text-sm">Copy</button>
                                    </div>
                                    <code className="text-white font-mono">npm install formax-ui react-hook-form zod</code>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-3xl md:text-4xl font-bold text-formax-600 mb-2">{stat.value}</div>
                                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Why Choose Formax UI?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            Unlike general UI libraries, Formax UI is laser-focused on forms, providing specialized solutions for common form challenges.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="feature-card group"
                            >
                                <div className={`w-12 h-12 ${feature.color} bg-current/10 rounded-lg flex items-center justify-center mb-4`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Example Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Get started in seconds
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                                Add typed validation, accessible fields, and submit handling without wiring every input manually.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">React Hook Form context built in</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Zod schema validation and schema rendering</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Full TypeScript support</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Link href="/docs/getting-started" className="btn-primary">
                                    Read Documentation
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="component-preview"
                        >
                            <div className="space-y-6">
                                <div className="code-block">
                                    <pre><code>{`import { Form, FormActions, TextField } from 'formax-ui';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

function ContactForm() {
  return (
    <Form
      schema={schema}
      defaultValues={{ name: '', email: '' }}
      onSubmit={async (values) => console.log(values)}
    >
      <TextField name="name" label="Your Name" required />
      <TextField name="email" label="Email" type="email" required />
      <FormActions submitLabel="Send Message" />
    </Form>
  );
}`}</code></pre>
                                </div>

                                <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Live Preview</h3>
                                    <Form
                                        schema={contactSchema}
                                        defaultValues={{ name: '', email: '' }}
                                        onSubmit={async () => undefined}
                                    >
                                        <TextField name="name" label="Your Name" placeholder="Enter your name" required />
                                        <TextField name="email" label="Email" type="email" placeholder="your@email.com" required />
                                        <FormActions submitLabel="Send Message" />
                                    </Form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 hero-gradient">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to build better forms?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join developers who are already building amazing form experiences with Formax UI.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/docs/getting-started" className="btn-primary bg-white text-formax-600 hover:bg-gray-50">
                                <Download className="w-5 h-5 mr-2" />
                                Get Started Now
                            </Link>
                            <Link href="https://github.com/Formax-UI/dev" className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <GitFork className="w-5 h-5 mr-2" />
                                View on GitHub
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

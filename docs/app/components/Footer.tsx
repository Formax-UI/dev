'use client';

import { Github, Heart, Twitter } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const footerLinks = {
    Documentation: [
        { name: 'Getting Started', href: '/docs/getting-started' },
        { name: 'Components', href: '/components' },
        { name: 'Examples', href: '/examples' },
        { name: 'Migration Guide', href: '/docs/migration' },
    ],
    Resources: [
        { name: 'Playground', href: '/playground' },
        { name: 'GitHub', href: 'https://github.com/Formax-UI/dev' },
        { name: 'NPM Package', href: 'https://npmjs.com/package/formax-ui' },
        { name: 'Changelog', href: '/docs/changelog' },
    ],
    Community: [
        { name: 'GitHub Issues', href: 'https://github.com/Formax-UI/dev/issues' },
        { name: 'Discussions', href: 'https://github.com/Formax-UI/dev/discussions' },
        { name: 'Contributing', href: '/docs/contributing' },
        { name: 'Code of Conduct', href: '/docs/code-of-conduct' },
    ],
};

export function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-formax-600 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="3" y="4" width="14" height="2" rx="1" fill="white" opacity="0.9" />
                                    <rect x="3" y="8" width="10" height="2" rx="1" fill="white" opacity="0.7" />
                                    <rect x="3" y="12" width="3" height="3" rx="1" fill="white" opacity="0.9" />
                                    <path d="M4 13.5L4.5 14L5.5 13" stroke="#0ea5e9" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="3" y="16" width="8" height="2" rx="1" fill="white" opacity="0.8" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Formax <span className="text-formax-600">UI</span>
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Beautiful and accessible form components for React applications.
                        </p>
                        <div className="flex space-x-4">
                            <Link
                                href="https://github.com/Formax-UI/dev"
                                className="text-gray-400 hover:text-formax-600 dark:hover:text-formax-400 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </Link>
                            <Link
                                href="https://twitter.com/FormaxUI"
                                className="text-gray-400 hover:text-formax-600 dark:hover:text-formax-400 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                                {title}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-600 dark:text-gray-400 hover:text-formax-600 dark:hover:text-formax-400 transition-colors text-sm"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            © 2024 Formax UI. All rights reserved.
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0 flex items-center">
                            Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> for developers
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
} 
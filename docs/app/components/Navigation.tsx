'use client';

import {
    ExternalLink,
    Github,
    Menu,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Components', href: '/components' },
    { name: 'Playground', href: '/playground' },
    { name: 'Examples', href: '/examples' },
];

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
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
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${pathname === item.href ? 'active' : ''
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="https://github.com/Formax-UI/dev"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="GitHub repository"
                        >
                            <Github className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </Link>

                        <Link
                            href="/docs/getting-started"
                            className="btn-primary text-sm px-4 py-2"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Open menu"
                        >
                            {isOpen ? (
                                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${pathname === item.href ? 'active' : ''
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href="https://github.com/Formax-UI/dev"
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-formax-600 dark:hover:text-formax-400"
                                onClick={() => setIsOpen(false)}
                            >
                                <Github className="w-5 h-5 mr-3" />
                                GitHub
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Link>

                            <Link
                                href="/docs/getting-started"
                                className="btn-primary text-sm px-3 py-2 mt-2 block text-center"
                                onClick={() => setIsOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
} 
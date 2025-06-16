import { Inter, JetBrains_Mono } from 'next/font/google'
import { Footer } from './components/Footer'
import { Navigation } from './components/Navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
    title: 'Formax UI - Forms-Only UI Kit for React',
    description: 'Beautiful and accessible form components for React applications',
    keywords: 'React, Forms, UI Components, TypeScript, Tailwind CSS',
    authors: [{ name: 'Formax UI Team' }],
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
            <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
                <div className="min-h-screen flex flex-col">
                    <Navigation />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    )
} 
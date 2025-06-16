import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Formax UI Playground',
    description: 'Test playground for Formax UI components',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-50">
                    <header className="bg-white shadow-sm border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center py-6">
                                <div className="flex items-center">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Formax UI
                                    </h1>
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-formax-100 text-formax-800">
                                        v1.0.0
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Forms-Only UI Kit for React
                                </p>
                            </div>
                        </div>
                    </header>
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
} 
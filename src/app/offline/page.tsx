import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export const metadata = {
    title: 'Offline - Inshort',
    description: 'You are currently offline.',
}

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-8">
                <WifiOff className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-4xl font-black font-display text-ink-black mb-4">
                You are offline
            </h1>
            <p className="text-xl text-gray-600 font-serif max-w-md mx-auto mb-8">
                It seems you&apos;ve lost your internet connection. We&apos;ve saved the articles you&apos;ve already visited.
            </p>
            <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
                Try Reloading
            </Link>
        </div>
    )
}

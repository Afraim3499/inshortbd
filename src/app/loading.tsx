import { Loader2 } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

export default function Loading() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-xl font-heading font-bold animate-pulse">লোড হচ্ছে...</p>
                </div>
            </main>
            <Footer />
        </>
    )
}

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/env'

export const metadata: Metadata = {
    title: 'Editorial Team - Inshort',
    description: 'Structure and standards of Inshort editorial board and newsroom.',
    alternates: {
        canonical: `${getSiteUrl()}/editorial-team`,
    },
}

const DEPARTMENTS = [
    {
        name: 'Inshort Editorial Board',
        description: 'Inshort is powered by a decentralized team of financial analysts, data engineers, and market researchers committed to unvarnished truth.'
    },
    {
        name: 'Global Markets Desk',
        description: 'Focused on equities, derivatives, and macro-economic trends across US and Asian markets.'
    },
    {
        name: 'Policy & Regulation',
        description: 'Analyzing the intersection of legislative action and market volatility.'
    },
    {
        name: 'Fintech & Strategy',
        description: 'Coverage of blockchain, DeFi, and the digitization of traditional finance.'
    }
]

export default function EditorialTeamPage() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background text-foreground">
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">আমাদের টিম</h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-2xl font-serif">
                        সত্যের সন্ধানে তথ্যের নির্ভুল পরিবেশনা।
                    </p>

                    <div className="grid gap-8 md:grid-cols-2">
                        {DEPARTMENTS.map((dept) => (
                            <div key={dept.name} className="p-6 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors">
                                <h2 className="text-xl font-bold mb-3 text-foreground">
                                    {dept.name}
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {dept.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-8 bg-accent/5 rounded-lg border border-accent/10">
                        <h3 className="text-xl font-heading font-bold mb-4">আমাদের সাথে যোগ দিন</h3>
                        <p className="text-muted-foreground mb-4">
                            আমরা সসর্বদা নতুন বিশেষজ্ঞের খোঁজে থাকি। আপনার যদি কোনো সুনির্দিষ্ট বিষয়ে গভীর জ্ঞান থাকে, তবে আমাদের সাথে যোগাযোগ করুন।
                        </p>
                        <a href="/contact" className="text-accent hover:underline font-medium">ক্যারিয়ার সম্পর্কে যোগাযোগ &rarr;</a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

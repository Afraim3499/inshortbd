import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/env'

export const metadata: Metadata = {
    title: 'Corrections Policy - Inshort',
    description: 'Our commitment to accuracy, transparency, and how we handle corrections.',
    alternates: {
        canonical: `${getSiteUrl()}/corrections`,
    },
}

export default function CorrectionsPage() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background text-foreground">
                <div className="max-w-3xl mx-auto px-4 py-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">Corrections Policy</h1>

                    <div className="prose prose-zinc prose-lg max-w-none">
                        <p className="lead text-xl text-muted-foreground font-serif">
                            Inshort is committed to accuracy. When we make errors, we correct them promptly and transparently.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Our Standard</h2>
                        <p>
                            Trust is our currency. We aim for 100% accuracy in our reporting. When we fall short, we do not hide it. We believe that admitting and correcting mistakes quickly builds trust with our readers.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">How We Handle Errors</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Factual Errors:</strong> If a story contains a factual error, we will edit the piece and append a note at the bottom of the article titled &quot;Correction,&quot; specifying what was wrong and what has been fixed.
                            </li>
                            <li>
                                <strong>Clarifications:</strong> If a story is factually correct but the language is misleading or incomplete, we will rewrite the section and append a &quot;Clarification&quot; note.
                            </li>
                            <li>
                                <strong>Updates:</strong> When new information becomes available for a developing story, we will add an &quot;Update&quot; label with a timestamp. This is distinct from a correction.
                            </li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Reporting an Error</h2>
                        <p>
                            If you spot an error in our coverage, please contact our editorial team immediately. We review all correction requests within 24 hours.
                        </p>
                        <div className="bg-accent/5 p-6 rounded-lg border border-accent/10 mt-6 not-prose">
                            <p className="font-bold text-lg mb-2">Contact Editorial Standards</p>
                            <p className="mb-4">Email us with the subject line &quot;Correction Request&quot; and a link to the article.</p>
                            <a href="mailto:corrections@inshortbd.com" className="text-accent hover:underline font-mono">corrections@inshortbd.com</a>
                        </div>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Retractions</h2>
                        <p>
                            In rare cases where a story is fundamentally flawed or violates our ethical standards, we may retract it. Retracted stories will remain on the site with a prominent &quot;RETRACTED&quot; label and an explanation from the Editor-in-Chief, preserving the URL for transparency.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

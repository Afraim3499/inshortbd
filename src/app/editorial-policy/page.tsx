import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Editorial Policy - Inshort',
  description: 'Inshort editorial policy and standards. Our commitment to accuracy, transparency, and unbiased reporting.',
  alternates: {
    canonical: `${getSiteUrl()}/editorial-policy`,
  },
}

export default function EditorialPolicyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">Editorial Policy</h1>

          <div className="prose prose-invert prose-zinc max-w-none space-y-8">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our commitment to accuracy, transparency, and journalistic integrity.
            </p>

            <div className="space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold">Accuracy and Verification</h2>
                <p>
                  Every article published on Inshort undergoes fact-checking and verification.
                  We source information from credible, verifiable sources and clearly distinguish
                  between facts and analysis.
                </p>
              </section>

              <section className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-2xl font-heading font-bold">Editorial Independence</h2>
                <p>
                  Our editorial decisions are made independently of advertisers, sponsors, or
                  external influences. Our reporting serves our readers, not special interests.
                </p>
              </section>

              <section className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-2xl font-heading font-bold">Transparency</h2>
                <p>
                  We are transparent about our sources and methods. When errors occur, we
                  correct them promptly and clearly, maintaining a record of corrections.
                </p>
              </section>

              <section className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-2xl font-heading font-bold">Ethics Standards</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We do not accept gifts or favors that could influence our reporting</li>
                  <li>We disclose potential conflicts of interest</li>
                  <li>We respect privacy while serving the public interest</li>
                  <li>We treat all subjects of our reporting fairly</li>
                </ul>
              </section>

              <section className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-2xl font-heading font-bold">Corrections Policy</h2>
                <p>
                  If we publish incorrect information, we correct it immediately and clearly.
                  Corrections are noted at the top or bottom of articles, and we maintain a
                  public record of significant corrections.
                </p>
              </section>

              <section className="space-y-4 pt-8 border-t border-border">
                <h2 className="text-2xl font-heading font-bold">Reader Feedback</h2>
                <p className="text-gray-600 mb-6">
                  We value reader feedback and take concerns seriously. If you believe we&apos;ve
                  violated these standards or have a correction to suggest, please contact our
                  standards editor. Please{' '}
                  <a href="/contact" className="text-accent hover:underline">
                    contact us
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}


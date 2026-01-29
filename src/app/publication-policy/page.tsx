import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'

export const metadata: Metadata = {
    title: 'Editorial & Publication Policy',
    description: 'Our commitment to truth, accuracy, and ethical journalism. Read Inshort\'s comprehensive editorial guidelines and standards.',
}

export default function PublicationPolicyPage() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="min-h-screen bg-white text-slate-text font-serif">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <header className="mb-16 border-b border-gray-200 pb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-ink-black mb-6 tracking-tight">
                        Editorial & Publication Policy
                    </h1>
                    <p className="text-lg text-gray-600 italic">
                        Last Updated: {currentDate}
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Table of Contents (Sticky) */}
                    <aside className="md:col-span-4 lg:col-span-3">
                        <div className="sticky top-24 space-y-4 font-sans text-sm">
                            <h3 className="font-bold text-ink-black uppercase tracking-wider text-xs mb-4">
                                Contents
                            </h3>
                            <nav className="flex flex-col space-y-3 text-gray-600">
                                <a href="#mission" className="hover:text-blood-red transition-colors">Mission & Ethics</a>
                                <a href="#verification" className="hover:text-blood-red transition-colors">Verification & Fact-Checking</a>
                                <a href="#demographics" className="hover:text-blood-red transition-colors">Demographic Representation</a>
                                <a href="#geography" className="hover:text-blood-red transition-colors">Geographic Compliance</a>
                                <a href="#corrections" className="hover:text-blood-red transition-colors">Corrections Policy</a>
                                <a href="#sources" className="hover:text-blood-red transition-colors">Sourcing & Anonymity</a>
                                <a href="#community" className="hover:text-blood-red transition-colors">Community Standards</a>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <article className="md:col-span-8 lg:col-span-9 space-y-16">

                        {/* Mission */}
                        <section id="mission" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                1. Mission & Code of Ethics
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    <strong>Inshort</strong> is committed to independent, fearless, and accurate journalism. We adhere strictly to the <strong>Press Council of Bangladesh Code of Ethics</strong>, which serves as the foundation of our editorial decision-making process.
                                </p>
                                <p>
                                    Our primary obligation is to the truth and the public&apos;s right to know. We report without fear or favor, independent of political, corporate, or sectional interests.
                                </p>
                            </div>
                        </section>

                        {/* Verification */}
                        <section id="verification" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                2. Verification & Fact-Checking
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    Accuracy is non-negotiable. Our verification process is rigorous and multi-layered:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mt-4">
                                    <li><strong>Corroboration:</strong> We require at least two independent sources for controversial or significant claims, unless a single source is an authoritative document or on-the-record official.</li>
                                    <li><strong>Primary Sources:</strong> We prioritize direct access to primary documents, data, and witness accounts over secondary reporting.</li>
                                    <li><strong>AI Policy:</strong> While we use technology to assist in data analysis, <strong>no article is written purely by AI</strong>. All content is researched, written, and verified by human editors.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Demographics */}
                        <section id="demographics" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                3. Demographic Representation & Inclusion
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    We believe accurate journalism must reflect the society it covers. We are committed to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mt-4">
                                    <li><strong>Diverse Voices:</strong> Actively seeking sources and experts from a wide range of backgrounds, including different ages, genders, ethnicities, and socioeconomic statuses.</li>
                                    <li><strong>Avoiding Stereotypes:</strong> We challenge stereotypes and avoid language that marginalizes or caricatures any group.</li>
                                    <li><strong>Accessibility:</strong> Ensuring our reporting is accessible to broad audiences, avoiding unnecessary jargon and providing context for complex issues.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Geography */}
                        <section id="geography" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                4. Geographic & Jurisdictional Compliance
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    As a Bangladesh-based publication with a global audience, we navigate a complex legal landscape with respect and diligence.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mt-4">
                                    <li><strong>Bangladeshi Law:</strong> We comply with all applicable Bangladeshi laws, including the <em>Digital Security Act 2018</em> and defamation statutes. We provide a clear right of reply to individuals subject to significant criticism.</li>
                                    <li><strong>International Standards:</strong> For our international readers, we respect global data protection standards (including GDPR and CCPA) regarding user privacy.</li>
                                    <li><strong>Contextual Reporting:</strong> When covering international events, we strive to understand and convey the local cultural, historical, and legal context, resisting a purely Western-centric lens.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Corrections */}
                        <section id="corrections" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                5. Corrections Policy
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    We own our mistakes. When an error occurs, we correct it promptly and transparently.
                                </p>
                                <p>
                                    <strong>Substantive Corrections:</strong> Errors of fact will be corrected in the text, and a note will be appended to the bottom of the article detailing the correction and the date it was made.
                                </p>
                                <p>
                                    To report an error, please contact <a href="mailto:corrections@inshortbd.com" className="text-blood-red hover:underline">corrections@inshortbd.com</a>.
                                </p>
                            </div>
                        </section>

                        {/* Sources */}
                        <section id="sources" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                6. Sourcing & Anonymity
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    Transparency is the default. We attribute information to named sources whenever possible. Anonymity is granted <strong>only</strong> when:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mt-4">
                                    <li>The source faces real danger, retribution, or harm.</li>
                                    <li>The information is of significant public interest and cannot be obtained otherwise.</li>
                                    <li>The source&apos;s motive has been thoroughly vetted by senior editors.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Community */}
                        <section id="community" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                7. Community Guidelines
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    We encourage robust debate but demand civility. We have a zero-tolerance policy for:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mt-4">
                                    <li>Hate speech, racism, sexism, or discrimination of any kind.</li>
                                    <li>Personal attacks, harassment, or doxxing.</li>
                                    <li>Spam or commercial self-promotion.</li>
                                </ul>
                            </div>
                        </section>

                    </article>
                </div>
            </main>

            <Footer />
            <BackToTop />
        </div>
    )
}

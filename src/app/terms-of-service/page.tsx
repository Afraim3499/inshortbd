import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Read the Terms of Service for Inshort. Understanding your rights and obligations when using our platform.',
}

export default function TermsOfServicePage() {
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
                        Terms of Service
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
                                <a href="#acceptance" className="hover:text-blood-red transition-colors">1. Acceptance</a>
                                <a href="#intellectual-property" className="hover:text-blood-red transition-colors">2. Intellectual Property</a>
                                <a href="#user-conduct" className="hover:text-blood-red transition-colors">3. User Conduct</a>
                                <a href="#disclaimer" className="hover:text-blood-red transition-colors">4. Disclaimer</a>
                                <a href="#liability" className="hover:text-blood-red transition-colors">5. Limitation of Liability</a>
                                <a href="#jurisdiction" className="hover:text-blood-red transition-colors">6. Governing Law</a>
                                <a href="#changes" className="hover:text-blood-red transition-colors">7. Changes to Terms</a>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <article className="md:col-span-8 lg:col-span-9 space-y-16">

                        {/* Acceptance */}
                        <section id="acceptance" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                1. Acceptance of Terms
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    By accessing or using <strong>Inshort</strong> website (&quot;the Site&quot;), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the Site.
                                </p>
                            </div>
                        </section>

                        {/* IP */}
                        <section id="intellectual-property" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                2. Intellectual Property
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    All content published on Inshort, including articles, photographs, images, graphics, audio, and video clips, is the property of Inshort or its content suppliers and is protected by Bangladeshi and international copyright laws.
                                </p>
                                <p>
                                    You may access and use the content for personal, non-commercial use only. You may not reproduce, distribute, modify, create derivative works of, publicly display, or sexually exploit any content without our prior written permission.
                                </p>
                            </div>
                        </section>

                        {/* User Conduct */}
                        <section id="user-conduct" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                3. User Conduct
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    You agree to use the Site only for lawful purposes. You are prohibited from:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mt-4">
                                    <li>Using the Site in any way that violates any applicable local, state, national, or international law.</li>
                                    <li>Attempting to compromise the security or integrity of the Site&apos;s systems.</li>
                                    <li>Using any automated means (such as robots or spiders) to access the Site for any purpose without our express permission.</li>
                                    <li>Posting comments or content that is defamatory, obscene, threatening, or abusive.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Disclaimer */}
                        <section id="disclaimer" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                4. Disclaimer of Warranties
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    The content on the Site is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either express or implied. While we strive for accuracy, Inshort does not warrant that the content is error-free, complete, or current.
                                </p>
                                <p>
                                    We reserve the right to correct any errors or omissions and to change or update information at any time without prior notice.
                                </p>
                            </div>
                        </section>

                        {/* Liability */}
                        <section id="liability" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                5. Limitation of Liability
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    To the fullest extent permitted by law, Inshort and its affiliates, editors, and contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Site.
                                </p>
                            </div>
                        </section>

                        {/* Governing Law */}
                        <section id="jurisdiction" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                6. Governing Law
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    These Terms of Service are governed by and construed in accordance with the laws of <strong>Bangladesh</strong>. You irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                                </p>
                            </div>
                        </section>

                        {/* Changes */}
                        <section id="changes" className="space-y-4">
                            <h2 className="text-2xl font-bold text-ink-black font-sans flex items-center gap-3">
                                <span className="w-8 h-1 bg-blood-red block"></span>
                                7. Changes to Terms
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    We reserve the right to modify these Terms of Service at any time. Your continued use of the Site following the posting of revised terms means that you accept and agree to the changes.
                                </p>
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

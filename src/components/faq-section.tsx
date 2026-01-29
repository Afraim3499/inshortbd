'use client'

import { FAQSchema } from './schema/faq-schema'

export interface FAQItem {
    question: string
    answer: string
}

interface FAQSectionProps {
    items: FAQItem[]
    title?: string
}

export function FAQSection({ items, title = "Frequently Asked Questions" }: FAQSectionProps) {
    return (
        <>
            <FAQSchema items={items} />
            <section className="my-12" aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="text-3xl font-heading font-bold mb-8 text-foreground">
                    {title}
                </h2>
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <details
                            key={index}
                            className="group border border-border rounded-lg overflow-hidden"
                        >
                            <summary className="cursor-pointer px-6 py-4 font-semibold text-foreground hover:bg-accent/5 transition-colors list-none flex items-center justify-between">
                                <span>{item.question}</span>
                                <svg
                                    className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <div className="px-6 py-4 text-muted-foreground bg-accent/5 border-t border-border">
                                <p>{item.answer}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </section>
        </>
    )
}

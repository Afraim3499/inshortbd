import { Navigation } from '@/components/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/env'

export const metadata: Metadata = {
  title: 'About Us - Inshort',
  description: 'Follow the path to the truth. Independent journalism tailored for the modern reader. In-depth analysis, financial insights, and breaking news.',
  alternates: {
    canonical: `${getSiteUrl()}/about`,
  },
}

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Breadcrumbs
            items={[
              { label: 'About', href: '/about' },
            ]}
          />
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">ইনশর্ট সম্পর্কে</h1>

          <div className="prose prose-invert prose-zinc max-w-none space-y-6">
            <p className="text-xl text-muted-foreground leading-relaxed">
              <strong className="text-foreground">সত্যের পথে চলুন।</strong>
            </p>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
              <p>
                ইনশর্ট একটি আধুনিক সংবাদ প্ল্যাটফর্ম যা তাদের জন্য ডিজাইন করা হয়েছে যারা গতি, স্বচ্ছতা এবং নিরপেক্ষ তথ্যকে গুরুত্ব দেন। আমরা বিশৃঙ্খলা ছাড়াই তথ্য উপস্থাপন করায় বিশ্বাসী, যা পাঠকদের নিজস্ব মতামত তৈরিতে সাহায্য করে।
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">আমাদের দর্শন</h2>
              <p>
                আমরা তথ্যের একটি আধুনিক টার্মিনাল হিসেবে কাজ করি - একটি উচ্চ-মানের এবং তথ্য-বহুল প্ল্যাটফর্ম যা অলঙ্করণের চেয়ে বিষয়বস্তুকে বেশি গুরুত্ব দেয়। আমাদের পরিষ্কার এবং উচ্চ-বৈসাদৃশ্যপূর্ণ ইন্টারফেস স্বচ্ছতা এবং ফোকাসের প্রতি আমাদের প্রতিশ্রুতি প্রতিফলিত করে।
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">আমরা যা প্রদান করি</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>সকল প্রতিবেদনে নির্ভুলতা এবং যাচাইকরণ</li>
                <li>সম্পাদকীয় প্রক্রিয়ায় স্বচ্ছতা</li>
                <li>মানের সাথে আপস না করে দ্রুত সংবাদ পরিবেশন</li>
                <li>পাঠক-কেন্দ্রিক ডিজাইন এবং অভিজ্ঞতা</li>
                <li>স্বাধীন এবং নিরপেক্ষ সাংবাদিকতা</li>
              </ul>
            </div>

            <div className="space-y-4 pt-8 border-t border-border">
              <h2 className="text-2xl font-heading font-bold">যোগাযোগ করুন</h2>
              <p>
                আমাদের জন্য কোনো প্রশ্ন, ফিডব্যাক বা খবরের টিপস আছে?{' '}
                <a href="/contact" className="text-accent hover:underline">
                  আমাদের সাথে যোগাযোগ করুন
                </a>{' '}
                অথবা সোশ্যাল মিডিয়ায় নক করুন।
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}


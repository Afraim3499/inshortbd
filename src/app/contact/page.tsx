import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/env'
import { Mail, Twitter, Instagram, Youtube, Facebook, Linkedin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - Inshort',
  description: 'Get in touch with Inshort news team. Questions, feedback, or story tips.',
  alternates: {
    canonical: `${getSiteUrl()}/contact`,
  },
}

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">যোগাযোগ করুন</h1>

          <div className="prose prose-invert prose-zinc max-w-none space-y-8">
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-serif">
              আমাদের জন্য কোনো প্রশ্ন, ফিডব্যাক বা খবরের টিপস আছে? আমরা আপনার কাছ থেকে শুনতে আগ্রহী।
            </p>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-4">ইনশর্ট-কে অনুসরণ করুন</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="https://twitter.com/InshortBD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium">Twitter/X</div>
                      <div className="text-sm text-muted-foreground">@InshortBD</div>
                    </div>
                  </a>

                  <a
                    href="https://facebook.com/bdinshort"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium">Facebook</div>
                      <div className="text-sm text-muted-foreground">bdinshort</div>
                    </div>
                  </a>

                  <a
                    href="https://www.instagram.com/inshortbangladesh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium">Instagram</div>
                      <div className="text-sm text-muted-foreground">inshortbangladesh</div>
                    </div>
                  </a>

                  <a
                    href="https://www.linkedin.com/company/inshortbd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium">LinkedIn</div>
                      <div className="text-sm text-muted-foreground">inshortbd</div>
                    </div>
                  </a>

                  <a
                    href="https://youtube.com/@InshortBD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <Youtube className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium">YouTube</div>
                      <div className="text-sm text-muted-foreground">@InshortBD</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <h2 className="text-2xl font-heading font-bold mb-4">সম্পাদকীয় অনুসন্ধান</h2>
                <p className="text-muted-foreground">
                  সম্পাদকীয় প্রশ্ন, খবর জমা দেওয়া বা মিডিয়া অনুসন্ধানের জন্য, অনুগ্রহ করে আমাদের সোশ্যাল মিডিয়া চ্যানেলের মাধ্যমে যোগাযোগ করুন অথবা আমাদের{' '}
                  <a href="/editorial-policy" className="text-accent hover:underline">
                    সম্পাদকীয় নীতিমালা
                  </a>
                  {' '}দেখুন।
                </p>
              </div>

              <div className="pt-8 border-t border-border">
                <h2 className="text-2xl font-heading font-bold mb-4">সাধারণ তথ্য</h2>
                <p className="text-gray-600 mb-6">
                  সাধারণ অনুসন্ধান বা ইনশর্ট প্ল্যাটফর্ম সম্পর্কে ফিডব্যাকের জন্য, আমরা সোশ্যাল মিডিয়ায় সক্রিয় আছি এবং প্রতিদিন আমাদের ইনবক্স চেক করি।
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}


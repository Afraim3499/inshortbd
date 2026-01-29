'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Twitter, Instagram, Youtube, Facebook, Linkedin, ArrowUp } from 'lucide-react'
import { NewsletterSignup } from './newsletter-signup'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

const CATEGORIES = ['Politics', 'Tech', 'Culture', 'Business', 'World']

// Bangla display names for categories
const CATEGORY_NAMES: Record<string, string> = {
  'Politics': 'রাজনীতি',
  'Tech': 'প্রযুক্তি',
  'Culture': 'সংস্কৃতি',
  'Business': 'ব্যবসা-বাণিজ্য',
  'World': 'বিশ্ব',
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="hidden lg:block border-t border-card-border bg-gradient-to-b from-white to-soft-wash/30 mt-24">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Branding Section */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block hover:opacity-80 transition-opacity"
              translate="no"
            >
              <Image
                src="/inshort-logo.svg"
                alt="Inshort"
                width={200}
                height={40}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm text-slate-text font-serif leading-relaxed">
              সংক্ষিপ্ত। নির্ভুল। ব্রেকিং। আধুনিক পাঠকের জন্য বিশ্বসংবাদ।
            </p>

            {/* Social Media Icons - Horizontal */}
            <div className="flex items-center gap-3 pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://twitter.com/InshortBD"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-soft-wash hover:bg-blood-red hover:text-white transition-all hover:scale-110 no-underline"
                      aria-label="Follow us on Twitter/X"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Twitter/X-এ অনুসরণ করুন</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://facebook.com/bdinshort"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-soft-wash hover:bg-blood-red hover:text-white transition-all hover:scale-110 no-underline"
                      aria-label="Follow us on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Facebook-এ অনুসরণ করুন</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.instagram.com/inshortbangladesh/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-soft-wash hover:bg-blood-red hover:text-white transition-all hover:scale-110 no-underline"
                      aria-label="Follow us on Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Instagram-এ অনুসরণ করুন</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.linkedin.com/company/inshortbd/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-soft-wash hover:bg-blood-red hover:text-white transition-all hover:scale-110 no-underline"
                      aria-label="Follow us on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>LinkedIn-এ অনুসরণ করুন</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://youtube.com/@InshortBD"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-soft-wash hover:bg-blood-red hover:text-white transition-all hover:scale-110 no-underline"
                      aria-label="Follow us on YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>YouTube-এ অনুসরণ করুন</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Categories Section - Horizontal Button Row */}
          <div>
            <h3
              className="font-sans font-semibold text-sm mb-4 text-ink-black"
              id="footer-categories"
            >
              বিভাগসমূহ
            </h3>
            <div className="flex flex-col gap-2" aria-labelledby="footer-categories">
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/category/${encodeURIComponent(category)}`}
                  className="footer-category-link"
                  aria-label={`${CATEGORY_NAMES[category]} বিভাগ দেখুন`}
                >
                  {CATEGORY_NAMES[category] || category}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links Section - Simple Links */}
          <div>
            <h3 className="font-sans font-semibold text-sm mb-4 text-ink-black">
              প্রয়োজনীয় লিঙ্ক
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/about"
                className="footer-link"
              >
                সম্পর্কে
              </Link>
              <Link
                href="/contact"
                className="footer-link"
              >
                যোগাযোগ
              </Link>
              <Link
                href="/publication-policy"
                className="footer-link"
              >
                নীতিমালা
              </Link>
              <Link
                href="/terms-of-service"
                className="footer-link"
              >
                শর্তাবলী
              </Link>
              <Link
                href="/feed.xml"
                className="footer-link"
              >
                RSS
              </Link>
              <Link
                href="/archive"
                className="footer-link"
              >
                আর্কাইভ
              </Link>
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="font-sans font-semibold text-sm mb-4 text-ink-black">
              সাথে থাকুন
            </h3>
            <div className="bg-white/80 backdrop-blur-sm border border-card-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-slate-text font-serif mb-4 leading-relaxed">
                নিরপেক্ষ সংবাদ এবং বিশ্লেষণ সরাসরি আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।
              </p>
              <NewsletterSignup variant="compact" source="footer" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-card-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              suppressHydrationWarning={true}
              className="text-xs text-meta-gray font-mono font-semibold"
              translate="no"
            >
              © {currentYear.toLocaleString('bn-BD')} ইনশর্ট। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex items-center gap-6">
              <div className="flex gap-6 text-xs text-meta-gray font-mono">
                <Link
                  href="/editorial-team"
                  className="hover:text-blood-red transition-colors no-underline"
                >
                  সম্পাদনা প্যানেল
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-blood-red transition-colors no-underline"
                >
                  যোগাযোগ
                </Link>
                <Link
                  href="/admin"
                  className="hover:text-blood-red transition-colors no-underline"
                >
                  অ্যাডমিন
                </Link>
              </div>
              <button
                onClick={scrollToTop}
                className="w-9 h-9 rounded-full bg-soft-wash hover:bg-blood-red hover:text-white transition-all flex items-center justify-center"
                aria-label="Back to top"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

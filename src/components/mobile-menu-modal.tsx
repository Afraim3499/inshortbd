'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, Twitter, Instagram, Youtube, Facebook, Linkedin, Mail, Shield, User } from 'lucide-react'

const MENU_ITEMS = [
    { label: 'রাজনীতি', href: '/category/Politics' },
    { label: 'প্রযুক্তি', href: '/category/Tech' },
    { label: 'ব্যবসা-বাণিজ্য', href: '/category/Business' },
    { label: 'সংস্কৃতি ও বিনোদন', href: '/category/Culture' },
    { label: 'বিশ্ব', href: '/category/World' },
]

const SECONDARY_LINKS = [
    { label: 'আমাদের সম্পর্কে', href: '/about', icon: User },
    { label: 'সম্পাদকীয় নীতি', href: '/publication-policy', icon: Shield },
    { label: 'যোগাযোগ', href: '/contact', icon: Mail },
]

interface MobileMenuModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function MobileMenuModal({ open, onOpenChange }: MobileMenuModalProps) {
    const router = useRouter()

    const handleLinkClick = (href: string) => {
        onOpenChange(false)
        router.push(href)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-full h-[100dvh] p-0 gap-0 bg-white/98 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 border-none rounded-none flex flex-col">
                <DialogTitle className="sr-only">মেইন মেনু</DialogTitle>
                <DialogDescription className="sr-only">নেভিগেশন মেনু</DialogDescription>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <span className="font-serif font-bold text-xl tracking-tight">ইনশর্ট</span>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Main Categories */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">বিভাগসমূহ</h3>
                        <div className="grid gap-3">
                            {MENU_ITEMS.map((item) => (
                                <button
                                    key={item.href}
                                    onClick={() => handleLinkClick(item.href)}
                                    className="flex items-center justify-between w-full text-left group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-2xl font-serif text-ink-black group-hover:text-primary transition-colors">
                                        {item.label}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100" />

                    {/* Secondary Links */}
                    <div className="space-y-2">
                        {SECONDARY_LINKS.map((link) => (
                            <button
                                key={link.href}
                                onClick={() => handleLinkClick(link.href)}
                                className="flex items-center gap-3 w-full text-left p-2 text-gray-600 hover:text-primary transition-colors"
                            >
                                <link.icon className="w-4 h-4" />
                                <span className="font-sans font-medium text-sm">{link.label}</span>
                            </button>
                        ))}
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-center gap-6">
                        <a href="https://twitter.com/InshortBD" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://facebook.com/bdinshort" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="https://www.instagram.com/inshortbangladesh/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="https://www.linkedin.com/company/inshortbd/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="https://www.youtube.com/@InShort-k1p" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600 transition-colors">
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}

'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { useHasMounted } from '@/hooks/use-has-mounted'

interface Ad {
    id: string
    title: string
    image_url: string
    target_url: string
    placement: string
}

interface AdUnitProps {
    placement: 'homepage_sidebar' | 'article_sidebar' | 'article_inline' | 'finance_banner'
    className?: string
}

export function AdUnit({ placement, className = '' }: AdUnitProps) {
    const [ad, setAd] = useState<Ad | null>(null)
    const hasMounted = useHasMounted()

    useEffect(() => {
        async function fetchAd() {
            const supabase = createClient()

            // Fetch active ads for this placement
            const { data: ads } = await (supabase
                .from('ads') as any)
                .select('*')
                .eq('placement', placement)
                .eq('active', true)

            if (ads && ads.length > 0) {
                // Select random ad
                const randomAd = ads[Math.floor(Math.random() * ads.length)] as Ad
                setAd(randomAd)
            }
        }
        fetchAd()
    }, [placement])

    if (!hasMounted || !ad) {
        return null
    }

    return (
        <div className={`block group ${className}`}>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-sans text-center">Advertisement</div>
            <Link href={ad.target_url} target="_blank" rel="noopener sponsored" className="block relative aspect-[300/250] w-full overflow-hidden rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <NewsImage
                    src={ad.image_url}
                    alt={ad.title}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </Link>
        </div>
    )
}


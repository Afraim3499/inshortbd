import { AdManager } from '@/components/admin/ads/ad-manager'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Ad Management - Admin',
}

export default function AdminAdsPage() {
    return <AdManager />
}

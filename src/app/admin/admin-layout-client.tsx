'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { HelpButton } from "@/components/onboarding/help-button"
import { WelcomeTour } from "@/components/onboarding/welcome-tour"
import { useEffect, useState } from "react"

export default function AdminLayoutClient({
    children,
    userId,
}: {
    children: React.ReactNode
    userId?: string
}) {
    const router = useRouter()
    const supabase = createClient()
    // const [userId, setUserId] = useState<string | undefined>() // Removed client-side state

    /* useEffect(() => {
        supabase.auth.getUser().then(({ data }: any) => {
            if (data?.user) {
                setUserId(data.user.id)
            }
        })
    }, []) */ // Removed client-side fetch

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="w-64 border-r border-border bg-card/50 p-4 fixed inset-y-0 flex flex-col">
                <div className="font-heading font-bold text-xl mb-8 px-4">Inshort <span className="text-accent text-xs block font-mono">ADMIN</span></div>
                <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
                    <Link href="/admin/dashboard" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Dashboard</Link>
                    <Link href="/admin/desk" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">The Desk</Link>
                    <Link href="/admin/team" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Team</Link>
                    <Link href="/admin/editor" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">The Editor</Link>
                    <Link href="/admin/calendar" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Editorial Calendar</Link>
                    <Link href="/admin/traffic" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Traffic Control</Link>
                    <Link href="/admin/analytics" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Analytics</Link>
                    <Link href="/admin/newsletter" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Newsletter</Link>
                    <Link href="/admin/social/tasks" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Social Tasks</Link>
                    <Link href="/admin/seo" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">SEO Dashboard</Link>
                    <Link href="/admin/media" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Media Library</Link>
                    <Link href="/admin/campaigns" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Campaigns</Link>
                    <Link href="/admin/ads" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Ads</Link>
                    <Link href="/admin/comments" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Comments</Link>
                    <Link href="/admin/collections" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Collections</Link>
                    <Link href="/admin/reports" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Reports</Link>
                    <Link href="/admin/assignments" className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Assignments</Link>
                </nav>
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start mt-4"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </aside>
            <main className="flex-1 ml-64 p-8">{children}</main>
            <HelpButton />
            <WelcomeTour userId={userId} />
        </div>
    )
}

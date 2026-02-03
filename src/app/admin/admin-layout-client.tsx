'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import { HelpButton } from "@/components/onboarding/help-button"
import { WelcomeTour } from "@/components/onboarding/welcome-tour"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export default function AdminLayoutClient({
    children,
    userId,
}: {
    children: React.ReactNode
    userId?: string
}) {
    const router = useRouter()
    const supabase = createClient()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="font-heading font-bold text-xl mb-8 px-4">Inshort <span className="text-accent text-xs block font-mono">ADMIN</span></div>
            <nav className="space-y-1 flex-1 overflow-y-auto -mx-2 px-2 pb-4">
                <Link href="/admin/dashboard" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Dashboard</Link>
                <Link href="/admin/desk" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">The Desk</Link>
                <Link href="/admin/team" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Team</Link>
                <Link href="/admin/editor" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">The Editor</Link>
                <Link href="/admin/calendar" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Editorial Calendar</Link>
                <Link href="/admin/traffic" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Traffic Control</Link>
                <Link href="/admin/analytics" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Analytics</Link>
                <Link href="/admin/newsletter" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Newsletter</Link>
                <Link href="/admin/social/tasks" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Social Tasks</Link>
                <Link href="/admin/seo" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">SEO Dashboard</Link>
                <Link href="/admin/media" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Media Library</Link>
                <Link href="/admin/campaigns" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Campaigns</Link>
                <Link href="/admin/ads" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Ads</Link>
                <Link href="/admin/comments" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Comments</Link>
                <Link href="/admin/collections" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Collections</Link>
                <Link href="/admin/reports" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Reports</Link>
                <Link href="/admin/assignments" onClick={() => setIsMobileOpen(false)} className="block px-4 py-2 rounded-md hover:bg-accent/10 text-sm font-medium">Assignments</Link>
            </nav>
            <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start mt-4 flex-shrink-0"
            >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
    )

    return (
        <div className="fixed inset-0 flex h-screen w-screen bg-background overflow-hidden z-[40]">
            {/* Desktop Sidebar (Static Flex Item) */}
            <aside className="hidden md:flex w-64 border-r border-border bg-card/50 flex-col flex-shrink-0">
                <NavContent />
            </aside>

            {/* Main Content Area (Flex Column) */}
            <div className="flex flex-1 flex-col overflow-hidden relative">
                {/* Mobile Header (Sticky Top within Main) */}
                <div className="md:hidden flex-shrink-0 h-16 border-b bg-background/80 backdrop-blur flex items-center px-4 z-50">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-4 pt-8">
                            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                            <NavContent />
                        </SheetContent>
                    </Sheet>
                    <div className="font-heading font-bold text-lg">Inshort Admin</div>
                </div>

                {/* Desktop Help Button & Tour (Overlay) */}
                <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
                    <div className="pointer-events-auto space-y-2 flex flex-col items-end">
                        <HelpButton />
                        {/* WelcomeTour handles its own absolute positioning usually, but if it renders null, fine. */}
                    </div>
                </div>
                <WelcomeTour userId={userId} />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}

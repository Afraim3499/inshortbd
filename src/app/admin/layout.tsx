import { Metadata } from "next"
import AdminLayoutClient from "./admin-layout-client"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

import { createClient } from "@/utils/supabase/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <AdminLayoutClient userId={user?.id}>{children}</AdminLayoutClient>
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationsClient } from "@/components/student/notifications-client"

export const dynamic = "force-dynamic"

export default async function StudentNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }
  
  return <NotificationsClient />
}

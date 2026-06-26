import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationsManagerClient } from "@/components/admin/notifications-manager-client"

export const dynamic = "force-dynamic"

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const allowedRoles = ["super_admin", "department_admin", "club_admin", "tournament_admin"]
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect("/student")
  }

  return <NotificationsManagerClient />
}

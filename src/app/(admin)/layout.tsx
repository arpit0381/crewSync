import { createClient } from "@/lib/supabase/server"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const name = user.user_metadata?.name || "Admin"
  const role = user.user_metadata?.role || "student"

  const allowedRoles = ["super_admin", "department_admin", "club_admin", "tournament_admin"]
  if (!allowedRoles.includes(role)) {
    redirect("/student")
  }

  return (
    <DashboardLayoutClient
      userEmail={user.email}
      userName={name}
      userRole={role}
    >
      {children}
    </DashboardLayoutClient>
  )
}

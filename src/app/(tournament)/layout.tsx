import { createClient } from "@/lib/supabase/server"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { redirect } from "next/navigation"

export default async function TournamentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const name = user.user_metadata?.name || "Tournament Admin"
  const role = user.user_metadata?.role || "student"

  const allowedRoles = ["super_admin", "tournament_admin"]
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

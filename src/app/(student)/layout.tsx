import { createClient } from "@/lib/supabase/server"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { redirect } from "next/navigation"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const name = user.user_metadata?.name || "Student"
  const role = user.user_metadata?.role || "student"

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

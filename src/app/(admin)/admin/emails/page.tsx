import { createAdminClient } from "@/lib/supabase/server"
import { EmailCenterClient } from "@/components/admin/email-center-client"

export const metadata = {
  title: "Email Center | Admin | Crew Sync",
}

export default async function AdminEmailCenterPage() {
  const supabase = createAdminClient()

  // Fetch events for the dropdown
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title")
    .order("title", { ascending: true })

  if (error) {
    console.error("Failed to fetch events for Email Center:", error)
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <EmailCenterClient events={events || []} />
    </div>
  )
}

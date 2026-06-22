import { createAdminClient } from "@/lib/supabase/server"
import { RegistrationsClient } from "./registrations-client"
import { getRegistrationsByEventAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminRegistrationsPage() {
  const supabase = createAdminClient()
  
  // Fetch all events for the dropdown
  const { data: eventsData } = await supabase
    .from("events")
    .select("id, title")
    .order("created_at", { ascending: false })

  const events = eventsData || []

  // Fetch initial registrations (all)
  const initialRegsResult = await getRegistrationsByEventAction("all")
  const initialRegs = initialRegsResult.data || []

  return (
    <RegistrationsClient 
      events={events} 
      initialRegs={initialRegs} 
    />
  )
}

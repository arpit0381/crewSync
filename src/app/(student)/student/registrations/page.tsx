import { createClient } from "@/lib/supabase/server"
import { TicketsClient } from "@/components/dynamic-imports"


export default async function StudentRegistrationsPage() {
  let dbTickets: any[] = []
  let profileName = "Student"
  let profileRoll = "N/A"
  let profileEmail = ""

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, roll_number, email")
        .eq("id", user.id)
        .maybeSingle()

      if (profile) {
        profileName = profile.name
        profileRoll = profile.roll_number || "N/A"
        profileEmail = profile.email || user.email || ""
      } else {
        profileEmail = user.email || ""
      }

      // Fetch registrations
      const { data: regs } = await supabase
        .from("registrations")
        .select(`
          id,
          created_at,
          payment_status,
          events:event_id (
            id,
            title,
            description,
            venue,
            event_date,
            event_time,
            categories(name, type)
          ),
          tickets(id, ticket_code)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (regs && regs.length > 0) {
        dbTickets = regs.map(reg => {
          // Flatten it to look like the old structure for TicketsClient, or update TicketsClient
          // We will update TicketsClient to handle this structure
          return {
            registration_id: reg.id,
            created_at: reg.created_at,
            payment_status: reg.payment_status,
            ticket: (reg.tickets as any) || null,
            event: reg.events
          }
        })
      }
    }
  } catch (err) {
    console.warn("Using mock registrations due to DB connection:", err)
  }

  const tickets = dbTickets

  return (
    <TicketsClient 
      initialTickets={tickets} 
      userName={profileName}
      userRoll={profileRoll}
      userEmail={profileEmail}
    />
  )
}

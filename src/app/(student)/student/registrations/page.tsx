import { createClient } from "@/lib/supabase/server"
import { TicketsClient } from "@/components/dynamic-imports"


export default async function StudentRegistrationsPage() {
  let dbTickets: any[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Fetch registrations join tickets
      const { data: tickets } = await supabase
        .from("tickets")
        .select(`
          id,
          ticket_code,
          registration:registration_id!inner (
            id,
            created_at,
            user_id,
            events:event_id (
              id,
              title,
              description,
              venue,
              event_date,
              event_time,
              categories(name, type)
            )
          )
        `)
        .eq("registration.user_id", user.id)
        .order("created_at", { ascending: false })

      if (tickets && tickets.length > 0) {
        dbTickets = tickets
      }
    }
  } catch (err) {
    console.warn("Using mock tickets due to DB connection:", err)
  }

  const tickets = dbTickets

  return <TicketsClient initialTickets={tickets} />
}

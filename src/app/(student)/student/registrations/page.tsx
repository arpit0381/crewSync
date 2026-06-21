import { createClient } from "@/lib/supabase/server"
import dynamic from "next/dynamic"

const TicketsClient = dynamic(
  () => import("@/components/student/tickets-client").then(mod => ({ default: mod.TicketsClient })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-card/10 rounded-2xl border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading tickets...
      </div>
    ),
  }
)


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

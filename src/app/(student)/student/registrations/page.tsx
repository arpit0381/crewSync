import { createClient } from "@/lib/supabase/server"
import { TicketsClient } from "@/components/student/tickets-client"

const MOCK_TICKETS = [
  {
    id: "tkt-1",
    ticket_code: "CRA-2026-829103",
    registration: {
      id: "reg-1",
      created_at: "2026-06-19T21:00:00.000Z",
      events: {
        id: "evt-1",
        title: "Tech Heist Hackathon",
        description: "The biggest annual 24-hour campus hackathon. Solve real-world industrial and college problems to win cash prizes.",
        venue: "Lab 4 & Central Seminar Hall",
        event_date: "2026-07-15",
        event_time: "09:00:00",
        categories: { name: "Hackathon", type: "technical" }
      }
    }
  },
  {
    id: "tkt-2",
    ticket_code: "CRA-2026-103984",
    registration: {
      id: "reg-2",
      created_at: "2026-06-19T21:05:00.000Z",
      events: {
        id: "evt-3",
        title: "Valorant Campus Arena",
        description: "Tactical 5v5 shooter challenge. Bring your crew, claim the spike, and rule the campus leaderboard.",
        venue: "Logix Club Esports Lab",
        event_date: "2026-07-28",
        event_time: "14:00:00",
        categories: { name: "Valorant", type: "esports" }
      }
    }
  }
]

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
          registration:registration_id (
            id,
            created_at,
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
        .order("created_at", { ascending: false })

      if (tickets && tickets.length > 0) {
        dbTickets = tickets
      }
    }
  } catch (err) {
    console.warn("Using mock tickets due to DB connection:", err)
  }

  const tickets = dbTickets.length > 0 ? dbTickets : MOCK_TICKETS

  return <TicketsClient initialTickets={tickets} />
}

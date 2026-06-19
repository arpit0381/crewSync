import { createClient } from "@/lib/supabase/server"
import { EventBrowserClient } from "@/components/student/event-browser-client"


export default async function StudentEventsPage() {
  let dbEvents: any[] = []
  let userRegistrations: string[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: regs } = await supabase
        .from("registrations")
        .select("event_id")
        .eq("user_id", user.id)

      if (regs) {
        userRegistrations = regs.map((r: any) => r.event_id)
      }
    }

    const { data: events } = await supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        banner_url,
        venue,
        event_date,
        event_time,
        capacity,
        reg_type,
        min_team_size,
        max_team_size,
        status,
        categories(name, type)
      `)
      .eq("status", "published")
      .order("event_date", { ascending: true })

    if (events && events.length > 0) {
      dbEvents = events
    }
  } catch (err) {
    console.warn("Using mock data inside StudentEventsPage due to DB connection:", err)
  }

  const events = dbEvents

  return <EventBrowserClient events={events} userRegistrations={userRegistrations} />
}

import { createClient } from "@/lib/supabase/server"
import { EventBrowserClient } from "@/components/student/event-browser-client"

const MOCK_EVENTS = [
  {
    id: "evt-1",
    title: "Tech Heist 2026",
    description: "The biggest annual 24-hour campus hackathon. Solve real-world industrial and college problems to win cash prizes.",
    banner_url: null,
    venue: "Lab 4 & Central Seminar Hall",
    event_date: "2026-07-15",
    event_time: "09:00:00",
    capacity: 250,
    reg_type: "team" as const,
    min_team_size: 2,
    max_team_size: 4,
    status: "published",
    categories: { name: "Hackathon", type: "technical" }
  },
  {
    id: "evt-3",
    title: "Valorant Campus Arena",
    description: "Tactical 5v5 shooter challenge. Bring your crew, claim the spike, and rule the campus leaderboard.",
    banner_url: null,
    venue: "Logix Club Esports Lab",
    event_date: "2026-07-28",
    event_time: "14:00:00",
    capacity: 100,
    reg_type: "team" as const,
    min_team_size: 5,
    max_team_size: 6,
    status: "published",
    categories: { name: "Valorant", type: "esports" }
  },
  {
    id: "evt-4",
    title: "Guest Lecture: AI Trends",
    description: "Guest lecture describing AI agents, edge computing models, and LLM orchestration strategies.",
    banner_url: null,
    venue: "Central Seminar Hall",
    event_date: "2026-07-02",
    event_time: "11:00:00",
    capacity: 150,
    reg_type: "individual" as const,
    min_team_size: 1,
    max_team_size: 1,
    status: "published",
    categories: { name: "Guest Lecture", type: "academic" }
  }
]

export default async function StudentEventsPage() {
  let dbEvents: any[] = []

  try {
    const supabase = await createClient()
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

  const events = dbEvents.length > 0 ? dbEvents : MOCK_EVENTS

  return <EventBrowserClient events={events} />
}

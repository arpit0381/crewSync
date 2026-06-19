import { createClient } from "@/lib/supabase/server"
import { AttendanceScannerClient } from "@/components/admin/attendance-scanner-client"

const MOCK_EVENTS = [
  {
    id: "evt-1",
    title: "Tech Heist Hackathon",
    venue: "Lab 4",
    event_date: "2026-07-15",
  },
  {
    id: "evt-3",
    title: "Valorant Campus Arena",
    venue: "Esports Lab",
    event_date: "2026-07-28",
  },
  {
    id: "evt-4",
    title: "Guest Lecture: AI Trends",
    venue: "Central Seminar Hall",
    event_date: "2026-07-02",
  }
]

export default async function AdminAttendancePage() {
  let dbEvents: any[] = []

  try {
    const supabase = await createClient()
    const { data: events } = await supabase
      .from("events")
      .select("id, title, venue, event_date")
      .eq("status", "published")
      .order("event_date", { ascending: true })

    if (events && events.length > 0) {
      dbEvents = events
    }
  } catch (err) {
    console.warn("Using mock events inside AdminAttendancePage due to DB connection:", err)
  }

  const events = dbEvents.length > 0 ? dbEvents : MOCK_EVENTS

  return <AttendanceScannerClient events={events} />
}

import { createClient } from "@/lib/supabase/server"
import { AttendanceScannerClient } from "@/components/dynamic-imports"


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

  const events = dbEvents

  return <AttendanceScannerClient events={events} />
}

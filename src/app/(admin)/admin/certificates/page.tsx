import { createClient } from "@/lib/supabase/server"
import { CertificatesEditorClient } from "@/components/admin/certificates-editor-client"

const MOCK_EVENTS = [
  { id: "evt-1", title: "Tech Heist Hackathon", event_date: "2026-07-15" },
  { id: "evt-3", title: "Valorant Campus Arena", event_date: "2026-07-28" },
  { id: "evt-4", title: "Guest Lecture: AI Trends", event_date: "2026-07-02" },
]

export default async function AdminCertificatesPage() {
  let dbEvents: any[] = []

  try {
    const supabase = await createClient()
    const { data: events } = await supabase
      .from("events")
      .select("id, title, event_date")
      .eq("status", "published")

    if (events && events.length > 0) {
      dbEvents = events
    }
  } catch (err) {
    console.warn("Using mock events inside AdminCertificatesPage due to DB connection:", err)
  }

  const events = dbEvents.length > 0 ? dbEvents : MOCK_EVENTS

  return <CertificatesEditorClient events={events} />
}

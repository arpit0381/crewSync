import { createClient } from "@/lib/supabase/server"
import { CertificatesEditorClient } from "@/components/admin/certificates-editor-client"


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

  const events = dbEvents

  return <CertificatesEditorClient events={events} />
}

import { createClient } from "@/lib/supabase/server"
import dynamic from "next/dynamic"

const AttendanceScannerClient = dynamic(
  () => import("@/components/admin/attendance-scanner-client").then(mod => ({ default: mod.AttendanceScannerClient })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-card/10 rounded-2xl border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading QR scanner...
      </div>
    ),
  }
)


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

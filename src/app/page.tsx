import { createClient } from "@/lib/supabase/server"
import { LandingClient } from "@/components/landing-client"

async function getPublishedEvents() {
  try {
    const supabase = await createClient()
    const { data: events, error } = await supabase
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
        categories(name, type),
        registrations(count)
      `)
      .eq("status", "published")
      .order("event_date", { ascending: true })

    if (error || !events) {
      console.warn("Could not fetch published events:", error)
      return null
    }

    return events.map(e => ({
      ...e,
      registrationsCount: (e.registrations as any)?.[0]?.count || 0
    }))
  } catch (err) {
    console.warn("Supabase connection failed:", err)
    return null
  }
}

export default async function LandingPage() {
  const dbEvents = await getPublishedEvents()
  const events = dbEvents || []

  return <LandingClient events={events as any} />
}

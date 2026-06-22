import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventDetailsClient } from "@/components/event-details-client"

export const dynamic = "force-dynamic"

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const supabase = await createClient()

  // 1. Fetch Event Details
  const { data: event, error: eventError } = await supabase
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
      categories(name, type),
      departments(name),
      clubs(name)
    `)
    .eq("id", id)
    .single()

  if (eventError || !event) {
    console.error("Error fetching event details:", eventError)
    notFound()
  }

  // 2. Check if user is logged in & registered
  const { data: { user } } = await supabase.auth.getUser()
  let isRegistered = false

  if (user) {
    const { data: reg } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single()

    if (reg) {
      isRegistered = true
    }
  }

  return (
    <main className="container mx-auto px-4 max-w-7xl">
      <EventDetailsClient 
        event={event as any} 
        isRegistered={isRegistered} 
        isLoggedIn={!!user} 
      />
    </main>
  )
}

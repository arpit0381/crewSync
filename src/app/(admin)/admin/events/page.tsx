import { createClient } from "@/lib/supabase/server"
import { EventManagerClient } from "@/components/admin/event-manager-client"


export default async function AdminEventsPage() {
  let dbEvents: any[] = []
  let dbCategories: any[] = []
  let dbDepartments: any[] = []
  let dbClubs: any[] = []

  try {
    const supabase = await createClient()

    // Run all queries in parallel
    const [categoriesResult, departmentsResult, clubsResult, eventsResult] = await Promise.all([
      supabase.from("categories").select("*"),
      supabase.from("departments").select("*"),
      supabase.from("clubs").select("*"),
      supabase.from("events")
        .select(`
          id, title, description, banner_url, venue, event_date, event_time,
          capacity, reg_type, min_team_size, max_team_size, status,
          category_id, department_id, club_id, categories(name, type),
          registrations(count)
        `)
        .order("created_at", { ascending: false }),
    ])

    if (categoriesResult.data?.length) dbCategories = categoriesResult.data
    if (departmentsResult.data?.length) dbDepartments = departmentsResult.data
    if (clubsResult.data?.length) dbClubs = clubsResult.data
    if (eventsResult.data?.length) {
      dbEvents = eventsResult.data.map(e => ({
        ...e,
        registrationsCount: e.registrations?.[0]?.count || 0
      }))
    }
  } catch (err) {
    console.warn("Using mock data inside AdminEventsPage due to DB connection:", err)
  }

  const events = dbEvents
  const categories = dbCategories
  const departments = dbDepartments
  const clubs = dbClubs

  return (
    <EventManagerClient
      initialEvents={events}
      categories={categories}
      departments={departments}
      clubs={clubs}
    />
  )
}

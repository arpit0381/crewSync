import { createClient } from "@/lib/supabase/server"
import { EventManagerClient } from "@/components/admin/event-manager-client"


export default async function AdminEventsPage() {
  let dbEvents: any[] = []
  let dbCategories: any[] = []
  let dbDepartments: any[] = []
  let dbClubs: any[] = []

  try {
    const supabase = await createClient()

    // 1. Fetch categories
    const { data: categories } = await supabase.from("categories").select("*")
    if (categories && categories.length > 0) dbCategories = categories

    // 2. Fetch departments
    const { data: departments } = await supabase.from("departments").select("*")
    if (departments && departments.length > 0) dbDepartments = departments

    // 3. Fetch clubs
    const { data: clubs } = await supabase.from("clubs").select("*")
    if (clubs && clubs.length > 0) dbClubs = clubs

    // 4. Fetch events
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
        category_id,
        department_id,
        club_id,
        categories(name, type)
      `)
      .order("created_at", { ascending: false })

    if (events && events.length > 0) dbEvents = events
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

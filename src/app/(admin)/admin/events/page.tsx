import { createClient } from "@/lib/supabase/server"
import { EventManagerClient } from "@/components/admin/event-manager-client"

// Generate standard mock categories
const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Workshop", type: "academic" },
  { id: "cat-2", name: "Hackathon", type: "technical" },
  { id: "cat-3", name: "Guest Lecture", type: "academic" },
  { id: "cat-4", name: "Cricket", type: "sports" },
  { id: "cat-5", name: "Valorant", type: "esports" },
]

const MOCK_DEPARTMENTS = [
  { id: "dept-1", name: "Bachelor of Computer Applications", code: "BCA" },
  { id: "dept-2", name: "Master of Computer Applications", code: "MCA" },
  { id: "dept-3", name: "Bachelor of Business Administration", code: "BBA" },
]

const MOCK_CLUBS = [
  { id: "club-1", name: "Logix Coding Club" },
  { id: "club-2", name: "Energy Sports Club" },
  { id: "club-3", name: "Cultural Arts Club" },
]

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
    status: "published" as const,
    category_id: "cat-2",
    categories: { name: "Hackathon", type: "technical" },
    department_id: "dept-1",
    club_id: "club-1",
  },
  {
    id: "evt-2",
    title: "Guest Lecture: Future of Web Development",
    description: "Speaker session detailing AI agents, edge runtime, and next-generation UI libraries.",
    banner_url: null,
    venue: "MBA Block Auditorium",
    event_date: "2026-06-30",
    event_time: "10:30:00",
    capacity: 120,
    reg_type: "individual" as const,
    min_team_size: 1,
    max_team_size: 1,
    status: "draft" as const,
    category_id: "cat-3",
    categories: { name: "Guest Lecture", type: "academic" },
    department_id: "dept-2",
    club_id: null,
  },
]

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

  const events = dbEvents.length > 0 ? dbEvents : MOCK_EVENTS
  const categories = dbCategories.length > 0 ? dbCategories : MOCK_CATEGORIES
  const departments = dbDepartments.length > 0 ? dbDepartments : MOCK_DEPARTMENTS
  const clubs = dbClubs.length > 0 ? dbClubs : MOCK_CLUBS

  return (
    <EventManagerClient
      initialEvents={events}
      categories={categories}
      departments={departments}
      clubs={clubs}
    />
  )
}

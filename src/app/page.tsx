import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Calendar, MapPin, Users, Award, ShieldCheck, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"


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
        categories(name, type)
      `)
      .eq("status", "published")
      .order("event_date", { ascending: true })

    if (error || !events) {
      console.warn("Could not fetch published events:", error)
      return null
    }

    return events
  } catch (err) {
    console.warn("Supabase connection failed:", err)
    return null
  }
}

// Fallback events in case the DB is empty or connection fails
const MOCK_EVENTS = [
  {
    id: "mock-1",
    title: "Tech Heist 2026",
    description: "The biggest annual 24-hour campus hackathon. Solve real-world industrial and college problems to win cash prizes.",
    banner_url: null,
    venue: "Lab 4 & Central Seminar Hall",
    event_date: "2026-07-15",
    event_time: "09:00:00",
    capacity: 250,
    reg_type: "team",
    categories: { name: "Hackathon", type: "technical" }
  },
  {
    id: "mock-2",
    title: "Inter-Department Cricket League",
    description: "Unleash the sporting spirit! Standard 10-over matches between BCA, MCA, BBA, and MBA departments.",
    banner_url: null,
    venue: "Main Campus Ground",
    event_date: "2026-07-20",
    event_time: "08:30:00",
    capacity: 64,
    reg_type: "team",
    categories: { name: "Cricket", type: "sports" }
  },
  {
    id: "mock-3",
    title: "Valorant Campus Arena",
    description: "Tactical 5v5 shooter challenge. Bring your crew, claim the spike, and rule the campus leaderboard.",
    banner_url: null,
    venue: "Logix Club Esports Lab",
    event_date: "2026-07-28",
    event_time: "14:00:00",
    capacity: 100,
    reg_type: "team",
    categories: { name: "Valorant", type: "esports" }
  }
]

export default async function LandingPage() {
  const dbEvents = await getPublishedEvents()
  const events = dbEvents && dbEvents.length > 0 ? dbEvents : MOCK_EVENTS

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <header className="flex h-20 items-center justify-between border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-wider">
              CREW <span className="text-primary">ARENA</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold hover:text-primary transition-colors px-4 py-2 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 text-center lg:py-28">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6 animate-pulse">
              <span>One Arena. Every Event.</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Campus Event & Tournament
              <span className="block mt-2 bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                Operating System
              </span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Eliminate paper sheets and messy spreadsheets. Manage college tournaments, 
              hackathons, workshops, live attendance scanning, and certificates from one central dashboard.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
              >
                Join the Arena
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-3 text-base font-semibold hover:bg-zinc-900 transition-colors"
              >
                Administrator Login
              </Link>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-12 border-t border-zinc-900">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Active & Upcoming Campus Events
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Browse and register for upcoming competitions, hackathons, and seminars.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/register"
                className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-all"
              >
                View all categories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const categoryName = Array.isArray(event.categories)
                ? event.categories[0]?.name
                : (event.categories as any)?.name;

              return (
                <div
                  key={event.id}
                  className="flex flex-col rounded-3xl border border-zinc-900 bg-zinc-900/30 backdrop-blur-sm overflow-hidden hover:border-zinc-800/80 transition-all duration-300 group hover:scale-[1.01]"
                >
                  {/* Event Image Banner */}
                  <div className="h-48 w-full relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                    {event.banner_url ? (
                      <img 
                        src={event.banner_url} 
                        alt={event.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-zinc-950/40" />
                    <span className="relative z-10 text-xs font-bold uppercase tracking-widest text-primary border border-primary/20 px-3 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-sm">
                      {categoryName || "Campus Event"}
                    </span>
                  </div>

                <div className="flex flex-1 flex-col p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-zinc-900 space-y-2.5 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-zinc-500">
                        <Users className="h-3 w-3" /> {event.reg_type === "team" ? "Team event" : "Individual"}
                      </span>
                      <span className="text-zinc-500">
                        Max Capacity: {event.capacity}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/register?event=${event.id}`}
                    className="w-full mt-4 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-primary hover:text-primary-foreground py-2.5 text-sm font-semibold transition-all border border-zinc-800 hover:border-primary text-white"
                  >
                    Register Now
                  </Link>
                </div>
              </div>
              )
            })}



          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-zinc-900 text-center text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Crew Arena. Designed for premium campus engagement.</p>
        </footer>
      </div>
    </div>
  )
}

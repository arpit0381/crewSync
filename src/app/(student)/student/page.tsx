import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Calendar, Ticket, Award, CheckSquare, Trophy, Users } from "lucide-react"


async function getStudentData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Run all count queries in parallel
    const [regResult, attResult, certResult, teamResult, recentRegsResult] = await Promise.all([
      supabase.from("registrations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("attendance").select("*", { count: "exact", head: true }).eq("student_id", user.id),
      supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("team_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("registrations").select("id, event_id, events(title, event_date, venue, categories(name, type))").eq("user_id", user.id).order('created_at', { ascending: false }).limit(5)
    ])

    return {
      regCount: regResult.count || 0,
      attCount: attResult.count || 0,
      certCount: certResult.count || 0,
      teamCount: teamResult.count || 0,
      recentRegs: recentRegsResult.data || []
    }
  } catch {
    return null
  }
}

export default async function StudentDashboardPage() {
  const stats = await getStudentData() || { regCount: 0, attCount: 0, certCount: 0, teamCount: 0, recentRegs: [] }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-card border border-border p-6 md:p-8 overflow-hidden">
        <div className="absolute -top-[40%] -right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[60px]" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Welcome to Crew Sync
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep track of your registered hackathons, active sports tournaments, tickets, 
            attendance check-ins, and verified certificates.
          </p>
          <div className="pt-2">
            <Link
              href="/student/events"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registrations</p>
            <p className="text-2xl font-bold text-foreground">{stats.regCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Ticket className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Teams</p>
            <p className="text-2xl font-bold text-foreground">{stats.teamCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendance</p>
            <p className="text-2xl font-bold text-foreground">{stats.attCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Certificates</p>
            <p className="text-2xl font-bold text-foreground">{stats.certCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Sections (Split layout) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Upcoming registrations */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Your Upcoming Registered Events</h2>
            <Link href="/student/registrations" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentRegs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-card/10 p-8 text-center text-muted-foreground text-sm">
                You haven't registered for any events yet.
              </div>
            ) : (
              stats.recentRegs.map((reg: any) => {
                const event = reg.events
                if (!event) return null
                
                const catName = event.categories?.name || "Event"
                
                return (
                  <div key={reg.id} className="rounded-xl border border-border/80 bg-card/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        {catName}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                      <p className="text-xs text-muted-foreground">Date: {event.event_date} | Venue: {event.venue}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/student/tickets`}
                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card transition-colors"
                      >
                        View QR Ticket
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right column - Quick options */}
        <div className="rounded-2xl border border-border bg-card/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Quick Access</h2>
          <div className="grid gap-2">
            <Link
              href="/student/tickets"
              className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 hover:border-border transition-all group"
            >
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">My Entry Tickets</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>
            <Link
              href="/student/certificates"
              className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 hover:border-border transition-all group"
            >
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">My Certificates</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>
            <Link
              href="/student/teams"
              className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 hover:border-border transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Team Invites</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

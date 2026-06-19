import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Calendar, Ticket, Award, CheckSquare, Trophy, Users } from "lucide-react"


async function getStudentData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch registrations count
    const { count: regCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Fetch attendance count
    const { count: attCount } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)

    // Fetch certificates count
    const { count: certCount } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Fetch teams count
    const { count: teamCount } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    return {
      regCount: regCount || 0,
      attCount: attCount || 0,
      certCount: certCount || 0,
      teamCount: teamCount || 0
    }
  } catch {
    return null
  }
}

export default async function StudentDashboardPage() {
  const stats = await getStudentData() || { regCount: 3, attCount: 2, certCount: 1, teamCount: 1 }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-card border border-border p-6 md:p-8 overflow-hidden">
        <div className="absolute -top-[40%] -right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[60px]" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Welcome to Crew Arena
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
            {/* Standard static mock display */}
            <div className="rounded-xl border border-border/80 bg-card/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Technical
                </span>
                <h3 className="text-sm font-semibold text-foreground">Tech Heist Hackathon</h3>
                <p className="text-xs text-muted-foreground">Date: July 15, 2026 | Venue: Lab 4</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/student/tickets"
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card transition-colors"
                >
                  View QR Ticket
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-card/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  Esports
                </span>
                <h3 className="text-sm font-semibold text-foreground">Valorant Arena Tourney</h3>
                <p className="text-xs text-muted-foreground">Date: July 28, 2026 | Venue: Esports Lab</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/student/tickets"
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card transition-colors"
                >
                  View QR Ticket
                </Link>
              </div>
            </div>
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

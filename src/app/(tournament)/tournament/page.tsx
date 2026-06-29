import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Trophy, Gamepad, Calendar, Users, Plus, ArrowUpRight } from "lucide-react"

async function getTournamentStats() {
  try {
    const supabase = await createClient()

    // Fetch total sports tournaments
    const { count: sportsCount } = await supabase
      .from("sports_tournaments")
      .select("*", { count: "exact", head: true })

    // Fetch total esports tournaments
    const { count: esportsCount } = await supabase
      .from("esports_tournaments")
      .select("*", { count: "exact", head: true })

    // Fetch matches count
    const { count: matchesCount } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })

    return {
      sportsCount: sportsCount || 0,
      esportsCount: esportsCount || 0,
      matchesCount: matchesCount || 0
    }
  } catch {
    return null
  }
}

export default async function TournamentDashboardPage() {
  const stats = await getTournamentStats() || { sportsCount: 2, esportsCount: 2, matchesCount: 16 }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-card border border-border p-6 md:p-8 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute -top-[40%] -right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Tournament Management
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Control sports and esports brackets, scheduling, and live standings. Manage teams, rosters, matches, and update live scores instantly.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              href="/tournament/matches?action=schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all"
            >
              <Calendar className="h-4 w-4" />
              Schedule Match
            </Link>
            <Link
              href="/admin/events?action=new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              New Tournament
            </Link>
          </div>
        </div>
        <div className="hidden md:block relative w-48 h-32 shrink-0 z-10">
          <img 
            src="/icons/undraw_work-time_1ogn.svg" 
            alt="Work scheduling timeline illustration" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Stats Blocks */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sports Events</p>
            <p className="text-2xl font-bold text-foreground">{stats.sportsCount || 3}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Esports Leagues</p>
            <p className="text-2xl font-bold text-foreground">{stats.esportsCount || 2}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Gamepad className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fixtures Configured</p>
            <p className="text-2xl font-bold text-foreground">{stats.matchesCount || 24}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Split details view */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Tournaments Grid */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Active Brackets & Standings</h2>
            <Link href="/tournament/brackets" className="text-xs font-semibold text-primary hover:underline">
              View all Brackets
            </Link>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card/40 p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                  Sports (Knockout)
                </span>
                <h3 className="text-sm font-semibold text-foreground">Inter-Department Cricket Cup</h3>
                <p className="text-xs text-muted-foreground">8 Teams | Next round: Quarter-Finals</p>
              </div>
              <Link href="/tournament/brackets?id=sports-1" className="p-2 bg-card hover:bg-muted rounded-lg border border-border">
                <ArrowUpRight className="h-4 w-4 text-foreground" />
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Esports (Room Setup)
                </span>
                <h3 className="text-sm font-semibold text-foreground">Valorant Campus League</h3>
                <p className="text-xs text-muted-foreground">Room details: Pending dispatch | Start: 02:00 PM</p>
              </div>
              <Link href="/tournament/matches?id=esports-1" className="p-2 bg-card hover:bg-muted rounded-lg border border-border">
                <ArrowUpRight className="h-4 w-4 text-foreground" />
              </Link>
            </div>
          </div>
        </div>

        {/* Administration Links */}
        <div className="rounded-2xl border border-border bg-card/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Tournament Operations</h2>
          <div className="grid gap-2">
            <Link
              href="/tournament/teams"
              className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 hover:border-border transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Register & Seed Teams</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>

            <Link
              href="/tournament/matches"
              className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 hover:border-border transition-all group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Live Score Submit Sheets</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

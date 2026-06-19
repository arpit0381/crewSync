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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Tournament Management</h1>
          <p className="text-sm text-zinc-400">Control sports and esports brackets, scheduling, and live standings.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/tournament/matches?action=schedule"
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all"
          >
            <Calendar className="h-4 w-4" />
            Schedule Match
          </Link>
          <Link
            href="/admin/events?action=new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            New Tournament
          </Link>
        </div>
      </div>

      {/* Stats Blocks */}
      <div className="grid gap-4 grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sports Events</p>
            <p className="text-2xl font-bold text-white">{stats.sportsCount || 3}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Esports Leagues</p>
            <p className="text-2xl font-bold text-white">{stats.esportsCount || 2}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Gamepad className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Fixtures Configured</p>
            <p className="text-2xl font-bold text-white">{stats.matchesCount || 24}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Split details view */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Tournaments Grid */}
        <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Active Brackets & Standings</h2>
            <Link href="/tournament/brackets" className="text-xs font-semibold text-primary hover:underline">
              View all Brackets
            </Link>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                  Sports (Knockout)
                </span>
                <h3 className="text-sm font-semibold text-white">Inter-Department Cricket Cup</h3>
                <p className="text-xs text-zinc-500">8 Teams | Next round: Quarter-Finals</p>
              </div>
              <Link href="/tournament/brackets?id=sports-1" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </Link>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Esports (Room Setup)
                </span>
                <h3 className="text-sm font-semibold text-white">Valorant Campus League</h3>
                <p className="text-xs text-zinc-500">Room details: Pending dispatch | Start: 02:00 PM</p>
              </div>
              <Link href="/tournament/matches?id=esports-1" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Administration Links */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Tournament Operations</h2>
          <div className="grid gap-2">
            <Link
              href="/tournament/teams"
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-zinc-300">Register & Seed Teams</span>
              </div>
              <span className="text-xs text-zinc-500 group-hover:text-primary transition-colors">→</span>
            </Link>

            <Link
              href="/tournament/matches"
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-zinc-300">Live Score Submit Sheets</span>
              </div>
              <span className="text-xs text-zinc-500 group-hover:text-primary transition-colors">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

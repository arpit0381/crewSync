import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Trophy, Calendar, Users, ArrowUpRight, Plus, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

const MOCK_SPORTS = [
  {
    id: "sports-mock-1",
    game_name: "Cricket (Inter-Dept Cup)",
    type: "knockout",
    status: "ongoing",
    event_title: "Inter-Department Cricket League",
    teams_count: 8,
    matches_count: 7
  },
  {
    id: "sports-mock-2",
    game_name: "Football Championship",
    type: "round_robin",
    status: "scheduled",
    event_title: "Monsoon Football Cup",
    teams_count: 6,
    matches_count: 15
  }
]

export default async function AdminSportsTourneysPage() {
  let dbSports: any[] = []

  try {
    const supabase = await createClient()
    const { data: tourneys } = await supabase
      .from("sports_tournaments")
      .select(`
        id,
        game_name,
        type,
        status,
        events (
          title
        )
      `)

    if (tourneys && tourneys.length > 0) {
      for (const t of tourneys) {
        // Count teams registered for the tournament
        const { count: teamsCount } = await supabase
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("event_id", t.id)

        // Count matches configured
        const { count: matchesCount } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("tournament_id", t.id)

        const eventObj = Array.isArray(t.events) ? t.events[0] : t.events

        dbSports.push({
          id: t.id,
          game_name: t.game_name,
          type: t.type,
          status: t.status,
          event_title: eventObj?.title || "Campus Sport Event",
          teams_count: teamsCount || 0,
          matches_count: matchesCount || 0
        })
      }
    }
  } catch (err) {
    console.warn("Using mock sports tourneys due to DB connection:", err)
  }

  const sports = dbSports.length > 0 ? dbSports : MOCK_SPORTS

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Sports Tournament Board</h1>
          <p className="text-sm text-zinc-400">Review sports brackets, knockout fixtures, and league standings statistics.</p>
        </div>
        <Link
          href="/tournament/teams?action=seed"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Seed Match Bracket
        </Link>
      </div>

      {/* Grid of tournaments */}
      {sports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500 bg-zinc-900/10">
          <Trophy className="h-12 w-12 mx-auto text-zinc-700 mb-2" />
          <p>No active sports tournaments found.</p>
          <p className="text-xs text-zinc-600 mt-1">Create a sports category event under Events dashboard to launch brackets.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sports.map((sport) => (
            <div
              key={sport.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group hover:border-zinc-700 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-750 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {sport.type} bracket
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight mt-1">{sport.game_name}</h3>
                    <p className="text-xs text-zinc-500 font-medium">{sport.event_title}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    sport.status === "ongoing"
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      : sport.status === "completed"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-950 border border-zinc-800 text-zinc-500"
                  }`}>
                    <Activity className="h-3 w-3" />
                    {sport.status}
                  </span>
                </div>

                {/* Tournament Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-850">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Registered Teams</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold text-white">{sport.teams_count} Teams</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Matches</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Trophy className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold text-white">{sport.matches_count} Fixtures</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigate Link */}
              <div className="mt-6 pt-4 border-t border-zinc-850 flex justify-end">
                <Link
                  href={`/tournament?id=${sport.id}`}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-900 transition-all cursor-pointer hover:border-zinc-700"
                >
                  Configure Fixtures
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

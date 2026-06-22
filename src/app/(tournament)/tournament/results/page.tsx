import { createClient } from "@/lib/supabase/server"
import { Trophy, Award } from "lucide-react"


export default async function TournamentResultsPage() {
  let dbStandings: any[] = []

  try {
    const supabase = await createClient()
    const { data: standings } = await supabase
      .from("standings")
      .select(`
        played,
        won,
        lost,
        drawn,
        points,
        team:team_id (name)
      `)
      .order("points", { ascending: false })

    if (standings && standings.length > 0) {
      dbStandings = standings.map((s: any) => ({
        team_name: s.team?.name || "Unknown",
        played: s.played,
        won: s.won,
        lost: s.lost,
        drawn: s.drawn,
        points: s.points
      }))
    }
  } catch (err) {
    console.warn("Database connection failed when fetching standings:", err)
  }

  const standings = dbStandings

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Standings & Results</h1>
        <p className="text-sm text-muted-foreground">View real-time league rankings and points leaderboards.</p>
      </div>

      <div className="rounded-3xl border border-border bg-card/20 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Points Table (Round Robin League)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-muted-foreground">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4 text-center">Played</th>
                <th className="py-3 px-4 text-center">Won</th>
                <th className="py-3 px-4 text-center">Lost</th>
                <th className="py-3 px-4 text-center">Drawn</th>
                <th className="py-3 px-4 text-center font-bold text-primary">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {standings.map((team, idx) => (
                <tr key={team.team_name} className="hover:bg-card/40">
                  <td className="py-3.5 px-4 font-bold text-muted-foreground">#{idx + 1}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{team.team_name}</td>
                  <td className="py-3.5 px-4 text-center">{team.played}</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400">{team.won}</td>
                  <td className="py-3.5 px-4 text-center text-rose-400">{team.lost}</td>
                  <td className="py-3.5 px-4 text-center">{team.drawn}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-primary">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

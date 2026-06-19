import { createClient } from "@/lib/supabase/server"
import { Trophy, Award } from "lucide-react"

const MOCK_STANDINGS = [
  { team_name: "BCA Techies", played: 3, won: 3, lost: 0, drawn: 0, points: 9 },
  { team_name: "MBA Giants", played: 3, won: 2, lost: 1, drawn: 0, points: 6 },
  { team_name: "MCA Coders", played: 3, won: 1, lost: 2, drawn: 0, points: 3 },
  { team_name: "BBA Titans", played: 3, won: 0, lost: 3, drawn: 0, points: 0 }
]

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
    console.warn("Using mock standings inside results page:", err)
  }

  const standings = dbStandings.length > 0 ? dbStandings : MOCK_STANDINGS

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Standings & Results</h1>
        <p className="text-sm text-zinc-400">View real-time league rankings and points leaderboards.</p>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Points Table (Round Robin League)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-400">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
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
                <tr key={team.team_name} className="hover:bg-zinc-900/40">
                  <td className="py-3.5 px-4 font-bold text-zinc-500">#{idx + 1}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{team.team_name}</td>
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

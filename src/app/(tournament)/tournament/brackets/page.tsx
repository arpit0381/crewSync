import { createClient } from "@/lib/supabase/server"
import { BracketsView } from "@/components/shared/brackets-view"

const MOCK_MATCHES = [
  {
    id: "m-1",
    round: 1,
    match_number: 1,
    status: "completed" as const,
    team1_score: "12",
    team2_score: "8",
    team1: { id: "t-1", name: "BCA Techies" },
    team2: { id: "t-2", name: "MCA Coders" },
    winner_id: "t-1"
  },
  {
    id: "m-2",
    round: 1,
    match_number: 2,
    status: "completed" as const,
    team1_score: "4",
    team2_score: "10",
    team1: { id: "t-3", name: "BBA Titans" },
    team2: { id: "t-4", name: "MBA Giants" },
    winner_id: "t-4"
  },
  {
    id: "m-3",
    round: 2,
    match_number: 1,
    status: "scheduled" as const,
    team1_score: null,
    team2_score: null,
    team1: { id: "t-1", name: "BCA Techies" },
    team2: { id: "t-4", name: "MBA Giants" },
    winner_id: null
  }
]

export default async function TournamentBracketsPage() {
  let dbMatches: any[] = []

  try {
    const supabase = await createClient()
    const { data: matches } = await supabase
      .from("matches")
      .select(`
        id,
        round,
        match_number,
        status,
        team1_score,
        team2_score,
        team1:team1_id (id, name),
        team2:team2_id (id, name),
        winner_id
      `)
      .order("round", { ascending: true })
      .order("match_number", { ascending: true })

    if (matches && matches.length > 0) {
      dbMatches = matches
    }
  } catch (err) {
    console.warn("Using mock matches in Brackets page:", err)
  }

  const matches = dbMatches.length > 0 ? dbMatches : MOCK_MATCHES

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-6 md:p-8">
      <BracketsView initialMatches={matches} isAdmin={false} />
    </div>
  )
}

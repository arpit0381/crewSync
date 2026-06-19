import { createClient } from "@/lib/supabase/server"
import { BracketsView } from "@/components/shared/brackets-view"


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

  const matches = dbMatches

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-6 md:p-8">
      <BracketsView initialMatches={matches} isAdmin={false} />
    </div>
  )
}

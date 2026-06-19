import { createClient } from "@/lib/supabase/server"
import { TournamentMatchesClient } from "@/components/admin/tournament-matches-client"


export default async function TournamentMatchesPage() {
  let dbEvents: any[] = []
  let dbMatches: any[] = []

  try {
    const supabase = await createClient()

    // Fetch team events that have a tournament linked
    const { data: events } = await supabase
      .from("events")
      .select(`
        id,
        title,
        reg_type,
        sports_tournament:sports_tournaments (id, type, game_name),
        esports_tournament:esports_tournaments (id, game_name)
      `)
      .eq("reg_type", "team")

    if (events && events.length > 0) {
      dbEvents = events
    }

    // Fetch matches
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
    console.warn("Using mock tournament data due to DB connection:", err)
  }

  const events = dbEvents
  const matches = dbMatches

  return <TournamentMatchesClient events={events} initialMatches={matches} />
}

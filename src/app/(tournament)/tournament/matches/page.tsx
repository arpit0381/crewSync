import { createClient } from "@/lib/supabase/server"
import { TournamentMatchesClient } from "@/components/admin/tournament-matches-client"

export const dynamic = "force-dynamic"

export default async function TournamentMatchesPage() {
  let dbEvents: any[] = []
  let dbMatches: any[] = []
  let isAdmin = false

  try {
    const supabase = await createClient()

    // 1. Fetch user role to determine if they are admin
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const role = user.user_metadata?.role || "student"
      isAdmin = ["super_admin", "department_admin", "club_admin", "tournament_admin"].includes(role)
    }

    // 2. Fetch team events that have a tournament linked
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

    // 3. Fetch all matches with event_id for client-side filtering
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
        winner_id,
        event_id
      `)
      .order("round", { ascending: true })
      .order("match_number", { ascending: true })

    if (matches && matches.length > 0) {
      dbMatches = matches
    }
  } catch (err) {
    console.warn("Database connection failed when fetching matches:", err)
  }

  return (
    <TournamentMatchesClient 
      events={dbEvents} 
      initialMatches={dbMatches} 
      isAdmin={isAdmin} 
    />
  )
}

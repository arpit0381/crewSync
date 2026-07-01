import { createClient } from "@/lib/supabase/server"
import { BracketsView } from "@/components/shared/brackets-view"

export const dynamic = "force-dynamic"

export default async function TournamentBracketsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams
  const urlId = params.id

  let tournaments: any[] = []
  let matches: any[] = []
  let standings: any[] = []
  let isAdmin = false
  let activeTourneyId = urlId || ""

  try {
    const supabase = await createClient()

    // 1. Fetch user role to determine if they can edit scores
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const role = user.user_metadata?.role || "student"
      isAdmin = ["super_admin", "department_admin", "club_admin", "tournament_admin"].includes(role)
    }

    // 2. Fetch active tournaments for selector dropdown
    const { data: sportsTourneys } = await supabase
      .from("sports_tournaments")
      .select("id, game_name, type")
    
    const { data: esportsTourneys } = await supabase
      .from("esports_tournaments")
      .select("id, game_name")

    tournaments = [
      ...(sportsTourneys || []).map((t) => ({ id: t.id, name: t.game_name, type: "sports", format: t.type })),
      ...(esportsTourneys || []).map((t) => ({ id: t.id, name: t.game_name, type: "esports", format: "knockout" }))
    ]

    // Default to the first tournament if none is in searchParams
    if (!activeTourneyId && tournaments.length > 0) {
      activeTourneyId = tournaments[0].id
    }

    if (activeTourneyId) {
      // 3. Fetch matches for selected tournament
      const { data: dbMatches } = await supabase
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
          sports_tournament_id,
          esports_tournament_id,
          event_id
        `)
        .or(`sports_tournament_id.eq.${activeTourneyId},esports_tournament_id.eq.${activeTourneyId}`)
        .order("round", { ascending: true })
        .order("match_number", { ascending: true })

      matches = dbMatches || []

      // 4. Fetch standings if it's a Round Robin tournament
      const activeTourney = tournaments.find((t) => t.id === activeTourneyId)
      if (activeTourney && activeTourney.format === "round_robin") {
        const { data: dbStandings } = await supabase
          .from("standings")
          .select(`
            played,
            won,
            lost,
            drawn,
            points,
            team:team_id (id, name)
          `)
          .eq("tournament_id", activeTourneyId)
          .order("points", { ascending: false })

        standings = dbStandings?.map((s: any) => ({
          team_name: s.team?.name || "Unknown",
          played: s.played,
          won: s.won,
          lost: s.lost,
          drawn: s.drawn,
          points: s.points
        })) || []
      }
    }
  } catch (err) {
    console.warn("DB connection failed when fetching bracket details:", err)
  }

  return (
    <div className="rounded-3xl border border-border bg-card/10 p-6 md:p-8">
      <BracketsView 
        initialMatches={matches} 
        isAdmin={isAdmin}
        tournaments={tournaments}
        activeTourneyId={activeTourneyId}
        standings={standings}
      />
    </div>
  )
}

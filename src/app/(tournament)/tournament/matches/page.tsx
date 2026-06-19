import { createClient } from "@/lib/supabase/server"
import { TournamentMatchesClient } from "@/components/admin/tournament-matches-client"

const MOCK_EVENTS = [
  {
    id: "evt-1",
    title: "Tech Heist Hackathon",
    reg_type: "team",
    sports_tournament: [{ id: "s-1", type: "knockout", game_name: "Cricket" }],
    esports_tournament: []
  },
  {
    id: "evt-3",
    title: "Valorant Campus Arena",
    reg_type: "team",
    sports_tournament: [],
    esports_tournament: [{ id: "e-1", game_name: "Valorant" }]
  }
]

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

  const events = dbEvents.length > 0 ? dbEvents : MOCK_EVENTS
  const matches = dbMatches.length > 0 ? dbMatches : MOCK_MATCHES

  return <TournamentMatchesClient events={events} initialMatches={matches} />
}

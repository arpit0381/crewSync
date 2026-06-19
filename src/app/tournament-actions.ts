"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function generateFixturesAction(
  eventId: string,
  tournamentId: string,
  type: "sports" | "esports",
  format: "knockout" | "round_robin"
) {
  const supabase = await createClient()

  // 1. Fetch all registered teams for this event
  const { data: teams, error: teamsErr } = await supabase
    .from("teams")
    .select("id, name")
    .eq("event_id", eventId)

  if (teamsErr || !teams || teams.length < 2) {
    return { error: "At least 2 teams must be registered to generate fixtures." }
  }

  // Delete existing matches to avoid duplicates
  await supabase
    .from("matches")
    .delete()
    .eq("event_id", eventId)

  // 2. Knockout Bracket Generator
  if (format === "knockout") {
    // Shuffle teams
    const shuffled = [...teams].sort(() => Math.random() - 0.5)
    const matchCount = Math.floor(shuffled.length / 2)

    // Round 1 insertions
    const matchesToInsert = []
    for (let i = 0; i < matchCount; i++) {
      matchesToInsert.push({
        event_id: eventId,
        sports_tournament_id: type === "sports" ? tournamentId : null,
        esports_tournament_id: type === "esports" ? tournamentId : null,
        round: 1,
        match_number: i + 1,
        team1_id: shuffled[i * 2].id,
        team2_id: shuffled[i * 2 + 1].id,
        status: "scheduled"
      })
    }

    // If odd number of teams, last team gets a bye to next round
    if (shuffled.length % 2 !== 0) {
      const lastTeam = shuffled[shuffled.length - 1]
      matchesToInsert.push({
        event_id: eventId,
        sports_tournament_id: type === "sports" ? tournamentId : null,
        esports_tournament_id: type === "esports" ? tournamentId : null,
        round: 1,
        match_number: matchCount + 1,
        team1_id: lastTeam.id,
        team2_id: null, // Bye
        winner_id: lastTeam.id, // Direct winner
        status: "completed",
        team1_score: "BYE",
        team2_score: "-"
      })
    }

    const { error: insertErr } = await supabase.from("matches").insert(matchesToInsert)
    if (insertErr) return { error: insertErr.message }

    revalidatePath("/tournament")
    return { success: "Knockout fixtures generated successfully!" }
  }

  // 3. Round Robin (League) Generator
  if (format === "round_robin") {
    const n = teams.length
    const teamsList = [...teams]
    const matchesToInsert = []

    // Circle method for scheduling round robin
    if (n % 2 !== 0) {
      teamsList.push({ id: null, name: "BYE" }) // Add dummy team for bye
    }

    const rounds = teamsList.length - 1
    const half = teamsList.length / 2

    let matchIdx = 1
    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < half; i++) {
        const home = teamsList[i]
        const away = teamsList[teamsList.length - 1 - i]

        if (home.id && away.id) {
          matchesToInsert.push({
            event_id: eventId,
            sports_tournament_id: type === "sports" ? tournamentId : null,
            esports_tournament_id: type === "esports" ? tournamentId : null,
            round: round + 1,
            match_number: matchIdx++,
            team1_id: home.id,
            team2_id: away.id,
            status: "scheduled"
          })
        }
      }
      // Rotate list (keep first element fixed)
      teamsList.splice(1, 0, teamsList.pop()!)
    }

    const { error: insertErr } = await supabase.from("matches").insert(matchesToInsert)
    if (insertErr) return { error: insertErr.message }

    // Seed empty standings table
    const standingsToInsert = teams.map((team) => ({
      tournament_id: tournamentId,
      team_id: team.id,
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0,
      points: 0
    }))

    await supabase.from("standings").delete().eq("tournament_id", tournamentId)
    await supabase.from("standings").insert(standingsToInsert)

    revalidatePath("/tournament")
    return { success: "Round Robin league fixtures and points table generated!" }
  }

  return { error: "Unsupported tournament format." }
}

export async function updateMatchScoreAction(
  matchId: string,
  team1Score: string,
  team2Score: string,
  winnerId: string | null
) {
  const supabase = await createClient()

  // 1. Fetch current match details
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single()

  if (matchErr || !match) return { error: "Match not found." }

  // 2. Update current match score
  const { error: updateErr } = await supabase
    .from("matches")
    .update({
      team1_score: team1Score,
      team2_score: team2Score,
      winner_id: winnerId,
      status: "completed"
    })
    .eq("id", matchId)

  if (updateErr) return { error: updateErr.message }

  // 3. Handle Round Robin Standings update
  if (match.sports_tournament_id && !match.round_bracket_match) {
    const t1 = match.team1_id
    const t2 = match.team2_id

    if (t1 && t2) {
      const t1Won = winnerId === t1
      const t2Won = winnerId === t2
      const isDraw = !winnerId || winnerId === "draw"

      // Update team 1 standing
      const { data: s1 } = await supabase
        .from("standings")
        .select("*")
        .eq("tournament_id", match.sports_tournament_id)
        .eq("team_id", t1)
        .single()

      if (s1) {
        await supabase
          .from("standings")
          .update({
            played: s1.played + 1,
            won: s1.won + (t1Won ? 1 : 0),
            lost: s1.lost + (t2Won ? 1 : 0),
            drawn: s1.drawn + (isDraw ? 1 : 0),
            points: s1.points + (t1Won ? 3 : isDraw ? 1 : 0)
          })
          .eq("id", s1.id)
      }

      // Update team 2 standing
      const { data: s2 } = await supabase
        .from("standings")
        .select("*")
        .eq("tournament_id", match.sports_tournament_id)
        .eq("team_id", t2)
        .single()

      if (s2) {
        await supabase
          .from("standings")
          .update({
            played: s2.played + 1,
            won: s2.won + (t2Won ? 1 : 0),
            lost: s2.lost + (t1Won ? 1 : 0),
            drawn: s2.drawn + (isDraw ? 1 : 0),
            points: s2.points + (t2Won ? 3 : isDraw ? 1 : 0)
          })
          .eq("id", s2.id)
      }
    }
  }

  // 4. Knockout progression: Propagate winner to next round match
  // We identify the next match in knockout brackets based on round and pairing indices
  // For round R and match M, it feeds into round R+1, match math.ceil(M/2).
  // Specifically: if M is odd, they occupy team1 of next match; if M is even, they occupy team2.
  if (winnerId && match.round) {
    const nextRound = match.round + 1
    const nextMatchNumber = Math.ceil(match.match_number / 2)
    const isTeam1Slot = match.match_number % 2 !== 0

    // Try to find if the next round match exists, or create it
    const { data: nextMatch } = await supabase
      .from("matches")
      .select("id")
      .eq("event_id", match.event_id)
      .eq("round", nextRound)
      .eq("match_number", nextMatchNumber)
      .maybeSingle()

    if (nextMatch) {
      // Update existing next round match slot
      const updateData = isTeam1Slot ? { team1_id: winnerId } : { team2_id: winnerId }
      await supabase
        .from("matches")
        .update(updateData)
        .eq("id", nextMatch.id)
    } else {
      // Create next round match with slot
      await supabase.from("matches").insert({
        event_id: match.event_id,
        sports_tournament_id: match.sports_tournament_id,
        esports_tournament_id: match.esports_tournament_id,
        round: nextRound,
        match_number: nextMatchNumber,
        team1_id: isTeam1Slot ? winnerId : null,
        team2_id: !isTeam1Slot ? winnerId : null,
        status: "scheduled"
      })
    }
  }

  revalidatePath("/tournament")
  return { success: "Match scores and standings updated successfully!" }
}

export async function updateEsportsRoomAction(
  tournamentId: string,
  roomId: string,
  roomPassword: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("esports_tournaments")
    .update({
      room_id: roomId,
      room_password: roomPassword
    })
    .eq("id", tournamentId)

  if (error) return { error: error.message }
  
  revalidatePath("/tournament")
  return { success: "Room credentials dispatched to participants!" }
}

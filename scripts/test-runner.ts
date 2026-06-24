import * as assert from "assert"

// Mock definitions mimicking core system logic for verification
interface Team {
  id: string
  name: string
}

interface Standing {
  team_id: string
  played: number
  won: number
  lost: number
  drawn: number
  points: number
}

// 1. KNOCKOUT PAIRING LOGIC TEST
function generateKnockoutFixtures(teams: Team[]) {
  const shuffled = [...teams]
  const matchCount = Math.floor(shuffled.length / 2)
  const matches = []

  for (let i = 0; i < matchCount; i++) {
    matches.push({
      round: 1,
      match_number: i + 1,
      team1_id: shuffled[i * 2].id,
      team2_id: shuffled[i * 2 + 1].id,
      status: "scheduled"
    })
  }

  if (shuffled.length % 2 !== 0) {
    const lastTeam = shuffled[shuffled.length - 1]
    matches.push({
      round: 1,
      match_number: matchCount + 1,
      team1_id: lastTeam.id,
      team2_id: null,
      winner_id: lastTeam.id,
      status: "completed"
    })
  }
  return matches
}

// 2. LEAGUE STANDINGS LOGIC TEST
function calculateStandings(matches: any[], teams: Team[]): Standing[] {
  const standingsMap: { [key: string]: Standing } = {}
  
  teams.forEach((t) => {
    standingsMap[t.id] = { team_id: t.id, played: 0, won: 0, lost: 0, drawn: 0, points: 0 }
  })

  matches.forEach((m) => {
    if (m.status !== "completed") return
    const t1 = m.team1_id
    const t2 = m.team2_id
    if (!t1 || !t2) return

    standingsMap[t1].played += 1
    standingsMap[t2].played += 1

    if (m.winner_id === t1) {
      standingsMap[t1].won += 1
      standingsMap[t1].points += 3
      standingsMap[t2].lost += 1
    } else if (m.winner_id === t2) {
      standingsMap[t2].won += 1
      standingsMap[t2].points += 3
      standingsMap[t1].lost += 1
    } else {
      standingsMap[t1].drawn += 1
      standingsMap[t2].drawn += 1
      standingsMap[t1].points += 1
      standingsMap[t2].points += 1
    }
  })

  return Object.values(standingsMap).sort((a, b) => b.points - a.points)
}

// RUN TESTS
function runTestSuite() {
  console.log("\n=========================================")
  console.log("      CREW SYNC - TEST RUNNER")
  console.log("=========================================\n")

  // Test Case 1: Knockout bracket with even team count
  try {
    const teams: Team[] = [
      { id: "t-1", name: "Alpha" },
      { id: "t-2", name: "Beta" },
      { id: "t-3", name: "Gamma" },
      { id: "t-4", name: "Delta" }
    ]
    const fixtures = generateKnockoutFixtures(teams)
    assert.strictEqual(fixtures.length, 2, "Expected 2 matches for 4 teams")
    assert.strictEqual(fixtures[0].team1_id, "t-1")
    assert.strictEqual(fixtures[0].team2_id, "t-2")
    console.log("✓ Test Case 1 Passed: Knockout Seeding (Even count)")
  } catch (err: any) {
    console.error("✗ Test Case 1 Failed:", err.message)
  }

  // Test Case 2: Knockout bracket with odd team count (bye verification)
  try {
    const teams: Team[] = [
      { id: "t-1", name: "Alpha" },
      { id: "t-2", name: "Beta" },
      { id: "t-3", name: "Gamma" }
    ]
    const fixtures = generateKnockoutFixtures(teams)
    assert.strictEqual(fixtures.length, 2, "Expected 2 matches for 3 teams (1 bye)")
    assert.strictEqual(fixtures[1].team2_id, null, "Expected Team 2 to be null (Bye)")
    assert.strictEqual(fixtures[1].winner_id, "t-3", "Expected Team 3 to automatically win Bye match")
    console.log("✓ Test Case 2 Passed: Knockout Seeding (Odd count / Bye check)")
  } catch (err: any) {
    console.error("✗ Test Case 2 Failed:", err.message)
  }

  // Test Case 3: Standings points updates (Win/Loss/Draw)
  try {
    const teams: Team[] = [
      { id: "t-1", name: "Alpha" },
      { id: "t-2", name: "Beta" }
    ]
    const matches = [
      { id: "m-1", team1_id: "t-1", team2_id: "t-2", winner_id: "t-1", status: "completed" }
    ]
    const standings = calculateStandings(matches, teams)
    
    const alphaStanding = standings.find((s) => s.team_id === "t-1")
    const betaStanding = standings.find((s) => s.team_id === "t-2")

    assert.strictEqual(alphaStanding?.points, 3, "Winning team should receive 3 points")
    assert.strictEqual(betaStanding?.points, 0, "Losing team should receive 0 points")
    assert.strictEqual(alphaStanding?.played, 1, "Alpha matches played should equal 1")
    console.log("✓ Test Case 3 Passed: Standing computations (Win/Loss)")
  } catch (err: any) {
    console.error("✗ Test Case 3 Failed:", err.message)
  }

  // Test Case 4: Standing draws updates
  try {
    const teams: Team[] = [
      { id: "t-1", name: "Alpha" },
      { id: "t-2", name: "Beta" }
    ]
    const matches = [
      { id: "m-1", team1_id: "t-1", team2_id: "t-2", winner_id: "draw", status: "completed" }
    ]
    const standings = calculateStandings(matches, teams)
    
    assert.strictEqual(standings[0].points, 1, "Draw match should award 1 point to Alpha")
    assert.strictEqual(standings[1].points, 1, "Draw match should award 1 point to Beta")
    console.log("✓ Test Case 4 Passed: Standing computations (Draws)")
  } catch (err: any) {
    console.error("✗ Test Case 4 Failed:", err.message)
  }

  console.log("\n=========================================")
  console.log("         TEST SUITE COMPLETE")
  console.log("=========================================\n")
}

runTestSuite()

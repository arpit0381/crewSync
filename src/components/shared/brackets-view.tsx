"use client"

import * as React from "react"
import { updateMatchScoreAction } from "@/app/tournament-actions"
import { Trophy, Calendar, Check, Loader2, X } from "lucide-react"

interface Match {
  id: string
  round: number
  match_number: number
  status: "scheduled" | "in_progress" | "completed"
  team1_score: string | null
  team2_score: string | null
  team1?: { id: string; name: string } | null
  team2?: { id: string; name: string } | null
  winner_id: string | null
}

interface BracketsViewProps {
  initialMatches: Match[]
  isAdmin?: boolean
}

export function BracketsView({ initialMatches, isAdmin = false }: BracketsViewProps) {
  const [matches, setMatches] = React.useState<Match[]>(initialMatches)
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [score1, setScore1] = React.useState("")
  const [score2, setScore2] = React.useState("")
  const [winnerId, setWinnerId] = React.useState<string>("")

  // Group matches by round
  const rounds: { [key: number]: Match[] } = {}
  matches.forEach((m) => {
    if (!rounds[m.round]) rounds[m.round] = []
    rounds[m.round].push(m)
  })

  // Sort matches within rounds
  Object.keys(rounds).forEach((r) => {
    rounds[Number(r)].sort((a, b) => a.match_number - b.match_number)
  })

  const handleOpenScoreModal = (match: Match) => {
    if (!isAdmin) return
    setSelectedMatch(match)
    setScore1(match.team1_score || "0")
    setScore2(match.team2_score || "0")
    setWinnerId(match.winner_id || "")
  }

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMatch) return

    setLoading(true)
    const result = await updateMatchScoreAction(selectedMatch.id, score1, score2, winnerId || null)

    if (result.success) {
      setMatches(
        matches.map((m) =>
          m.id === selectedMatch.id
            ? {
                ...m,
                team1_score: score1,
                team2_score: score2,
                winner_id: winnerId || null,
                status: "completed",
              }
            : m
        )
      )
      setSelectedMatch(null)
    }
    setLoading(false)
  }

  const getRoundName = (roundNum: number, totalRounds: number) => {
    if (roundNum === totalRounds) return "Finals"
    if (roundNum === totalRounds - 1) return "Semi-Finals"
    if (roundNum === totalRounds - 2) return "Quarter-Finals"
    return `Round ${roundNum}`
  }

  const totalRounds = Object.keys(rounds).length

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Knockout Brackets</h2>
      </div>

      {/* Horizontal scrolling tree */}
      <div className="flex gap-10 overflow-x-auto pb-6 pt-2 scrollbar-thin">
        {Object.keys(rounds).map((roundKey) => {
          const roundNum = Number(roundKey)
          const roundMatches = rounds[roundNum]

          return (
            <div key={roundKey} className="flex flex-col gap-6 min-w-[240px] justify-around">
              <div className="text-center py-1.5 px-3 bg-card border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {getRoundName(roundNum, totalRounds)}
              </div>

              <div className="flex flex-col gap-10 justify-center flex-1 py-4">
                {roundMatches.map((match) => {
                  const t1 = match.team1
                  const t2 = match.team2
                  const isCompleted = match.status === "completed"

                  return (
                    <div
                      key={match.id}
                      onClick={() => handleOpenScoreModal(match)}
                      className={`rounded-2xl border border-border bg-card/40 p-4 space-y-3 transition-all ${
                        isAdmin ? "cursor-pointer hover:border-primary/60 hover:scale-[1.01]" : ""
                      }`}
                    >
                      {/* Team 1 Row */}
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isCompleted && match.winner_id === t1?.id ? "text-primary font-bold" : "text-muted-foreground"
                          }`}
                        >
                          {t1?.name || "TBD"}
                        </span>
                        <span className="text-xs font-bold text-foreground px-2 py-0.5 bg-background rounded-md">
                          {match.team1_score !== null ? match.team1_score : "-"}
                        </span>
                      </div>

                      {/* Team 2 Row */}
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isCompleted && match.winner_id === t2?.id ? "text-primary font-bold" : "text-muted-foreground"
                          }`}
                        >
                          {t2?.name || "TBD"}
                        </span>
                        <span className="text-xs font-bold text-foreground px-2 py-0.5 bg-background rounded-md">
                          {match.team2_score !== null ? match.team2_score : "-"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border/80">
                        <span>Match #{match.match_number}</span>
                        <span className="capitalize">{match.status.replace("_", " ")}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Admin Score submission overlay */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-foreground mb-4">Submit Match Score</h3>

            <form onSubmit={handleSaveScore} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                    {selectedMatch.team1?.name || "Team 1"}
                  </span>
                  <input
                    type="text"
                    required
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-center text-foreground focus:outline-none focus:border-primary text-sm font-semibold"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                    {selectedMatch.team2?.name || "Team 2"}
                  </span>
                  <input
                    type="text"
                    required
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-center text-foreground focus:outline-none focus:border-primary text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Declare Winner</label>
                <select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all font-semibold"
                >
                  <option value="">Choose Winner</option>
                  {selectedMatch.team1 && (
                    <option value={selectedMatch.team1.id}>{selectedMatch.team1.name}</option>
                  )}
                  {selectedMatch.team2 && (
                    <option value={selectedMatch.team2.id}>{selectedMatch.team2.name}</option>
                  )}
                  <option value="draw">Draw Match</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { generateFixturesAction } from "@/app/tournament-actions"
import { BracketsView } from "@/components/shared/brackets-view"
import { Calendar, Play, RefreshCw, Trophy, AlertCircle, Loader2 } from "lucide-react"

interface Team {
  id: string
  name: string
}

interface Match {
  id: string
  round: number
  match_number: number
  status: "scheduled" | "in_progress" | "completed"
  team1_score: string | null
  team2_score: string | null
  team1?: Team | null
  team2?: Team | null
  winner_id: string | null
  event_id?: string
}

interface EventTournament {
  id: string
  title: string
  reg_type: string
  sports_tournament?: { id: string; type: string; game_name: string }[]
  esports_tournament?: { id: string; game_name: string }[]
}

interface TournamentMatchesClientProps {
  events: EventTournament[]
  initialMatches: Match[]
  isAdmin?: boolean
}

export function TournamentMatchesClient({ events, initialMatches, isAdmin = false }: TournamentMatchesClientProps) {
  const [selectedEventId, setSelectedEventId] = React.useState(events[0]?.id || "")
  const [matches, setMatches] = React.useState<Match[]>(initialMatches)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    setMatches(initialMatches)
  }, [initialMatches])

  const activeEvent = events.find((e) => e.id === selectedEventId)
  
  // Filter matches for the selected event
  const activeMatches = matches.filter((m) => m.event_id === selectedEventId)

  const handleGenerateFixtures = async () => {
    if (!activeEvent) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    const isSports = (activeEvent.sports_tournament?.length || 0) > 0
    const tourneyId = isSports 
      ? activeEvent.sports_tournament?.[0]?.id 
      : activeEvent.esports_tournament?.[0]?.id

    if (!tourneyId) {
      setError("Tournament configuration not found for this event.")
      setLoading(false)
      return
    }

    const type = isSports ? "sports" : ("esports" as any)
    const format = isSports && activeEvent.sports_tournament?.[0]?.type === "league" ? "round_robin" : "knockout"

    const result = await generateFixturesAction(activeEvent.id, tourneyId, type, format)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(result.success)
      // Smoothly refresh server data
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Selector and Actions */}
      <div className="rounded-3xl border border-border bg-card/20 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose Event / Tournament</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all font-semibold"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.reg_type})
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateFixtures}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Generate Fixtures
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Render Brackets view with appropriate admin state */}
      <div className="rounded-3xl border border-border bg-card/10 p-6 md:p-8">
        <BracketsView initialMatches={activeMatches} isAdmin={isAdmin} />
      </div>
    </div>
  )
}

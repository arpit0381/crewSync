"use client"

import * as React from "react"
import { updateEsportsRoomAction } from "@/app/tournament-actions"
import { Gamepad, Send, Key, Loader2 } from "lucide-react"

interface EsportsTournament {
  id: string
  game_name: string
  room_id: string | null
  room_password: string | null
  events: {
    title: string
  }
}

interface EsportsCredentialsProps {
  tournaments: EsportsTournament[]
}

export function EsportsCredentialsClient({ tournaments }: EsportsCredentialsProps) {
  const [selectedTourneyId, setSelectedTourneyId] = React.useState(tournaments[0]?.id || "")
  const [roomId, setRoomId] = React.useState("")
  const [roomPassword, setRoomPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState<string | null>(null)

  const activeTourney = tournaments.find((t) => t.id === selectedTourneyId)

  React.useEffect(() => {
    if (activeTourney) {
      setRoomId(activeTourney.room_id || "")
      setRoomPassword(activeTourney.room_password || "")
    }
  }, [selectedTourneyId, tournaments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTourneyId) return

    setLoading(true)
    setSuccess(null)

    const result = await updateEsportsRoomAction(selectedTourneyId, roomId, roomPassword)

    if (result.success) {
      setSuccess(result.success)
      // Update local state
      const idx = tournaments.findIndex((t) => t.id === selectedTourneyId)
      if (idx !== -1) {
        tournaments[idx].room_id = roomId
        tournaments[idx].room_password = roomPassword
      }
    }
    setLoading(false)
  }

  return (
    <div className="rounded-3xl border border-border bg-card/20 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Gamepad className="h-5 w-5 text-purple-400" />
        <h2 className="text-lg font-bold text-foreground">Esports Room dispatcher</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Disseminate custom Room IDs and passwords. Registered squad members will receive these details instantly.
      </p>

      {tournaments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No esports events configured.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose League</label>
            <select
              value={selectedTourneyId}
              onChange={(e) => setSelectedTourneyId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all font-semibold"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.game_name} - {t.events.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room ID</label>
              <input
                type="text"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-zinc-600 focus:border-primary focus:outline-none text-sm font-semibold transition-all"
                placeholder="E.g. Room_8829"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room Password</label>
              <input
                type="text"
                required
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-zinc-600 focus:border-primary focus:outline-none text-sm font-semibold transition-all"
                placeholder="E.g. pass123"
              />
            </div>
          </div>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 text-xs text-center font-semibold">
              {success}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Dispatch Room Details
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

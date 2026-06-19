"use client"

import * as React from "react"
import { registerForEventAction } from "@/app/event-actions"
import { Calendar, MapPin, Users, X, Loader2, Award, ClipboardCheck } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  venue: string
  event_date: string
  event_time: string
  capacity: number
  reg_type: "individual" | "team"
  min_team_size: number
  max_team_size: number
  status: string
  categories?: { name: string; type: string }
}

interface EventBrowserClientProps {
  events: Event[]
}

export function EventBrowserClient({ events }: EventBrowserClientProps) {
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [inviteCodeResult, setInviteCodeResult] = React.useState<string | null>(null)

  // Team registration variables
  const [teamMode, setTeamMode] = React.useState<"create" | "join">("create")
  const [teamName, setTeamName] = React.useState("")
  const [inviteCode, setInviteCode] = React.useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setInviteCodeResult(null)

    const result = await registerForEventAction(
      selectedEvent.id,
      selectedEvent.reg_type,
      selectedEvent.reg_type === "team"
        ? {
            mode: teamMode,
            teamName: teamMode === "create" ? teamName : undefined,
            inviteCode: teamMode === "join" ? inviteCode : undefined,
          }
        : undefined
    )

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success) {
      setSuccess(result.success)
      if (result.inviteCode) {
        setInviteCodeResult(result.inviteCode)
      }
      setLoading(false)
      // Reset inputs
      setTeamName("")
      setInviteCode("")
    }
  }

  const handleClose = () => {
    setSelectedEvent(null)
    setError(null)
    setSuccess(null)
    setInviteCodeResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Upcoming Campus Events</h1>
        <p className="text-sm text-zinc-400">Discover and register for workshops, sports, esports, and hackathons.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-hidden hover:border-zinc-700 transition-all group"
          >
            <div className="p-6 flex flex-col flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {event.categories?.name || "Campus Event"}
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  {event.reg_type}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">
                  {event.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-800 space-y-2 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{event.event_date} at {event.event_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(event)}
                className="w-full mt-2 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-primary hover:text-primary-foreground hover:border-primary py-2.5 text-sm font-semibold transition-all"
              >
                Register
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Overlay Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 shadow-2xl">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-zinc-800 text-zinc-400"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white pr-6">{selectedEvent.title}</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{selectedEvent.description}</p>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-sm flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ClipboardCheck className="h-4 w-4 shrink-0" />
                    <span>Registration Complete!</span>
                  </div>
                  <span className="text-center text-xs">{success}</span>

                  {inviteCodeResult && (
                    <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center w-full">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Share Invite Code</p>
                      <p className="text-lg font-black tracking-widest text-primary select-all mt-1">{inviteCodeResult}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Teammates can enter this code to join your team.</p>
                    </div>
                  )}
                </div>
              )}

              {!success && (
                <>
                  {/* Team Fields Selection */}
                  {selectedEvent.reg_type === "team" && (
                    <div className="space-y-4">
                      <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                        <button
                          type="button"
                          onClick={() => setTeamMode("create")}
                          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                            teamMode === "create" ? "bg-primary text-primary-foreground shadow" : "text-zinc-500"
                          }`}
                        >
                          Create Team
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeamMode("join")}
                          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                            teamMode === "join" ? "bg-primary text-primary-foreground shadow" : "text-zinc-500"
                          }`}
                        >
                          Join Team
                        </button>
                      </div>

                      {teamMode === "create" ? (
                        <div className="animate-in fade-in duration-200">
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Team Name</label>
                          <input
                            type="text"
                            required
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-505 focus:border-primary focus:outline-none text-sm transition-all"
                            placeholder="E.g. Code Commandos"
                          />
                          <p className="text-[10px] text-zinc-500 mt-1">
                            Team size limit: {selectedEvent.min_team_size} to {selectedEvent.max_team_size} members.
                          </p>
                        </div>
                      ) : (
                        <div className="animate-in fade-in duration-200">
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Invite Code</label>
                          <input
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-505 focus:border-primary focus:outline-none text-sm transition-all tracking-wider font-semibold uppercase"
                            placeholder="E.g. A4D8F3"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEvent.reg_type === "individual" && (
                    <p className="text-sm text-zinc-300 py-2">
                      Confirming your individual entry to this event. A ticket QR will be generated.
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/85">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-850 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all disabled:opacity-50"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {selectedEvent.reg_type === "team" && teamMode === "create" ? "Create & Register" : "Confirm Entry"}
                    </button>
                  </div>
                </>
              )}

              {success && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold hover:bg-primary/90"
                  >
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

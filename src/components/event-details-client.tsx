"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { registerForEventAction } from "@/app/event-actions"
import { Calendar, MapPin, Users, Loader2, ArrowLeft, Clock, Info, Shield, CheckCircle, Ticket, X } from "lucide-react"

interface EventDetails {
  id: string
  title: string
  description: string
  banner_url?: string | null
  venue: string
  event_date: string
  event_time: string
  capacity: number
  reg_type: "individual" | "team"
  min_team_size: number
  max_team_size: number
  status: string
  categories?: { name: string; type: string }
  departments?: { name: string } | null
  clubs?: { name: string } | null
}

interface EventDetailsClientProps {
  event: EventDetails
  isRegistered: boolean
  isLoggedIn: boolean
}

export function EventDetailsClient({ event, isRegistered, isLoggedIn }: EventDetailsClientProps) {
  const [showRegModal, setShowRegModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [inviteCodeResult, setInviteCodeResult] = React.useState<string | null>(null)
  const [isSuccessfullyRegistered, setIsSuccessfullyRegistered] = React.useState(isRegistered)

  // Team registration variables
  const [teamMode, setTeamMode] = React.useState<"create" | "join">("create")
  const [teamName, setTeamName] = React.useState("")
  const [inviteCode, setInviteCode] = React.useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn) {
      window.location.href = `/login?next=/events/${event.id}`
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setInviteCodeResult(null)

    const result = await registerForEventAction(
      event.id,
      event.reg_type,
      event.reg_type === "team"
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
      setIsSuccessfullyRegistered(true)
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowRegModal(false)
    setError(null)
    if (success && event.reg_type === "individual") {
      setSuccess(null)
    }
  }

  return (
    <div className="pb-24 lg:pb-12 min-h-screen">
      {/* Back button */}
      <div className="pt-6 pb-4">
        <Link 
          href="/student/events" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-zinc-900 border border-border/50 mb-8 aspect-[21/9] md:aspect-[3/1]">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt={event.title}
            fill
            className="object-cover opacity-60"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-zinc-900 to-purple-900/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
          <div className="flex flex-col gap-4 max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider backdrop-blur-md">
                {event.categories?.name || "Event"}
              </span>
              <span className="inline-flex items-center rounded-full bg-zinc-800/80 border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-300 uppercase tracking-wider backdrop-blur-md">
                {event.reg_type === "team" ? "Team Event" : "Individual"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-zinc-300 font-medium">
              <span>Organized by:</span>
              <span className="text-white font-bold">
                {event.clubs?.name || event.departments?.name || "Campus Administration"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card/30 backdrop-blur-md border border-border rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              About the Event
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card/40 backdrop-blur-md border border-border rounded-3xl p-6 sticky top-6">
            <h3 className="text-lg font-bold mb-6 border-b border-border pb-4">Event Details</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Date</p>
                  <p className="font-semibold text-foreground">{event.event_date}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Time</p>
                  <p className="font-semibold text-foreground">{event.event_time}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Venue</p>
                  <p className="font-semibold text-foreground">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Registration</p>
                  <p className="font-semibold text-foreground capitalize">
                    {event.reg_type}
                    {event.reg_type === "team" && ` (${event.min_team_size}-${event.max_team_size} members)`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              {isSuccessfullyRegistered ? (
                <div className="w-full flex flex-col items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20 p-4 text-green-500 text-center">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  <span className="font-bold">You're Registered!</span>
                  <Link href="/student/registrations" className="text-xs text-green-400 mt-1 underline hover:text-green-300">
                    View your ticket
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegModal(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground py-4 font-bold text-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1"
                >
                  <Ticket className="h-5 w-5" />
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-40">
        {isSuccessfullyRegistered ? (
          <Link
            href="/student/registrations"
            className="w-full flex items-center justify-center rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 py-3.5 font-bold transition-all"
          >
            <CheckCircle className="mr-2 h-5 w-5" /> View Ticket
          </Link>
        ) : (
          <button
            onClick={() => setShowRegModal(true)}
            className="w-full flex items-center justify-center rounded-xl bg-primary text-primary-foreground py-3.5 font-bold shadow-lg shadow-primary/20"
          >
            Register Now
          </button>
        )}
      </div>

      {/* Registration Modal */}
      {showRegModal && !isSuccessfullyRegistered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-background border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
              <h2 className="text-lg font-bold">Register for Event</h2>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{event.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You are registering as {event.reg_type === "team" ? "part of a team" : "an individual"}.
              </p>

              {error && (
                <div className="mb-6 rounded-xl bg-destructive/15 border border-destructive/30 p-4 text-sm text-destructive flex items-start gap-3">
                  <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 rounded-xl bg-green-500/15 border border-green-500/30 p-4 text-sm text-green-500 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle className="h-5 w-5" />
                    <span>{success}</span>
                  </div>
                  {inviteCodeResult && (
                    <div className="mt-2 bg-black/20 p-3 rounded-lg border border-green-500/20">
                      <p className="text-xs text-green-400 mb-1">Share this Invite Code with your team:</p>
                      <p className="text-lg font-mono font-bold tracking-widest text-white select-all">
                        {inviteCodeResult}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!success && (
                <form onSubmit={handleRegister} className="space-y-5">
                  {event.reg_type === "team" && (
                    <div className="space-y-4">
                      <div className="flex rounded-xl bg-card border border-border p-1">
                        <button
                          type="button"
                          onClick={() => setTeamMode("create")}
                          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                            teamMode === "create" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Create New Team
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeamMode("join")}
                          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                            teamMode === "join" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Join Existing
                        </button>
                      </div>

                      {teamMode === "create" ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Team Name</label>
                          <input
                            type="text"
                            required
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Enter an awesome team name"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Invite Code</label>
                          <input
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Enter 6-character code"
                            maxLength={10}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 py-3.5 font-bold transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Registration"}
                  </button>
                </form>
              )}

              {success && (
                <button
                  onClick={handleCloseModal}
                  className="w-full mt-4 rounded-xl bg-card border border-border text-foreground hover:bg-muted py-3.5 font-bold transition-all"
                >
                  Close & View Event
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

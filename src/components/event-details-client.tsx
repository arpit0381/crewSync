"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { registerForEventAction } from "@/app/event-actions"
import { Calendar, MapPin, Users, Loader2, ArrowLeft, Clock, Info, Shield, CheckCircle, Ticket, X, Share2, Check, Maximize2 } from "lucide-react"

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
  isFull?: boolean
  isClosed?: boolean
}

export function EventDetailsClient({ event, isRegistered, isLoggedIn, isFull, isClosed }: EventDetailsClientProps) {
  const [showRegModal, setShowRegModal] = React.useState(false)
  const [showPosterModal, setShowPosterModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [inviteCodeResult, setInviteCodeResult] = React.useState<string | null>(null)
  const [isSuccessfullyRegistered, setIsSuccessfullyRegistered] = React.useState(isRegistered)

  // Team registration variables
  const [teamMode, setTeamMode] = React.useState<"create" | "join">("create")
  const [teamName, setTeamName] = React.useState("")
  const [inviteCode, setInviteCode] = React.useState("")
  const [isCopied, setIsCopied] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = event.title
    const text = `Check out ${title} on Crew Sync!`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (err) {
        if ((err as Error).name === "AbortError") return
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy", err)
    }
  }

  // Auto-open modal if action=register is present
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const action = urlParams.get("action")
      const invite = urlParams.get("invite")
      
      if (action === "register" && isLoggedIn && !isSuccessfullyRegistered) {
        setShowRegModal(true)
        
        if (invite && event.reg_type === "team") {
          setTeamMode("join")
          setInviteCode(invite)
        }
        
        // Clean up URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, "", newUrl)
      }
    }
  }, [isLoggedIn, isSuccessfullyRegistered, event.reg_type])

  const handleRegisterClick = () => {
    if (!isLoggedIn) {
      const urlParams = new URLSearchParams(window.location.search)
      const invite = urlParams.get("invite")
      let redirectUrl = `/events/${event.id}?action=register`
      if (invite) {
        redirectUrl += `&invite=${invite}`
      }
      window.location.href = `/register?redirect=${encodeURIComponent(redirectUrl)}`
      return
    }
    setShowRegModal(true)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn) {
      const urlParams = new URLSearchParams(window.location.search)
      const invite = urlParams.get("invite")
      let redirectUrl = `/events/${event.id}?action=register`
      if (invite) {
        redirectUrl += `&invite=${invite}`
      }
      window.location.href = `/register?redirect=${encodeURIComponent(redirectUrl)}`
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
        if (teamMode === "create") {
          showToast("Awesome! Now invite more participants to your team.")
        }
      }
      setIsSuccessfullyRegistered(true)
      setLoading(false)
    }
  }

  const handleCopyInviteLink = async (code: string) => {
    const inviteUrl = `${window.location.origin}/events/${event.id}?action=register&invite=${code}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      showToast("Invite link copied! Share it with your team.")
    } catch (err) {
      console.error("Failed to copy link", err)
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
    <div className="pb-32 lg:pb-16 min-h-screen relative selection:bg-primary/30">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-primary/20">
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="pt-8 pb-6">
        <Link 
          href="/student/events" 
          className="inline-flex items-center text-sm font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-zinc-950 border border-white/5 mb-10 shadow-2xl flex flex-col lg:flex-row items-stretch min-h-[400px]">
        
        {/* Blurred background */}
        {event.banner_url ? (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src={event.banner_url}
              alt="background"
              fill
              className="object-cover opacity-20 blur-[80px] scale-110 mix-blend-screen"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent lg:bg-gradient-to-r lg:from-zinc-950 lg:via-zinc-950/80 lg:to-transparent" />
          </div>
        ) : (
           <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-primary/10 z-0 pointer-events-none" />
        )}

        {/* Content Side */}
        <div className="relative z-10 flex flex-col justify-end lg:justify-center p-8 md:p-12 lg:w-3/5 order-2 lg:order-1">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-4 py-1.5 text-xs font-black text-primary uppercase tracking-widest backdrop-blur-md shadow-inner">
                {event.categories?.name || "Event"}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/10 px-4 py-1.5 text-xs font-black text-zinc-300 uppercase tracking-widest backdrop-blur-md shadow-inner">
                {event.reg_type === "team" ? "Team Event" : "Individual"}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-5 leading-[1.1] drop-shadow-xl">
              {event.title}
            </h1>
            
            <div className="flex items-center gap-3 text-zinc-400 font-medium text-lg mt-2 mb-8 bg-black/20 self-start px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-sm">
              <span>Organized by</span>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-zinc-100 font-bold tracking-wide">
                {event.clubs?.name || event.departments?.name || "Campus Administration"}
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl px-6 py-4 transition-all font-bold shadow-xl group"
              >
                {isCopied ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <Share2 className="h-5 w-5 group-hover:-translate-y-0.5 group-hover:scale-110 transition-all text-zinc-300 group-hover:text-white" />
                )}
                <span>{isCopied ? "Copied Link!" : "Share Event"}</span>
              </button>
            </div>
        </div>

        {/* Poster Side */}
        <div className="relative z-10 lg:w-2/5 p-6 md:p-8 lg:p-12 order-1 lg:order-2 flex items-center justify-center lg:justify-end">
            {event.banner_url ? (
                <div 
                  className="relative w-full max-w-[280px] sm:max-w-xs lg:max-w-sm aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group cursor-pointer rotate-2 hover:rotate-0 transition-transform duration-500"
                  onClick={() => setShowPosterModal(true)}
                >
                  <Image
                    src={event.banner_url}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-8 backdrop-blur-[2px]">
                     <div className="bg-white/10 text-white rounded-full p-4 backdrop-blur-md border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 mb-3">
                        <Maximize2 className="h-6 w-6" />
                     </div>
                     <span className="text-white font-bold text-sm tracking-widest uppercase">View Full Poster</span>
                  </div>
                </div>
            ) : (
               <div className="relative w-full max-w-sm aspect-[4/5] rounded-[2rem] bg-zinc-900/50 border border-white/5 flex flex-col items-center justify-center text-zinc-600">
                  <div className="bg-zinc-800 p-4 rounded-full mb-3">
                     <Image className="h-8 w-8 opacity-50" src="/placeholder.svg" alt="placeholder" width={32} height={32} />
                  </div>
                  <span className="font-bold tracking-wider uppercase text-sm">No Poster Available</span>
               </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-zinc-950/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-white">
              <div className="bg-primary/20 p-3 rounded-2xl text-primary border border-primary/20">
                 <Info className="h-6 w-6" />
              </div>
              About the Event
            </h2>
            <div className="prose prose-invert prose-lg max-w-none prose-p:text-zinc-400 prose-p:leading-relaxed prose-headings:text-zinc-200">
              <p className="whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-950/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 sticky top-8 shadow-2xl">
            <h3 className="text-xl font-black mb-8 text-white flex items-center gap-3">
               Event Details
            </h3>
            
            <div className="space-y-7">
              <div className="flex items-start gap-5">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 shrink-0">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="pt-1">
                  <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Date</p>
                  <p className="font-black text-white text-lg">{event.event_date}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="pt-1">
                  <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Time</p>
                  <p className="font-black text-white text-lg">{event.event_time}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="pt-1">
                  <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Venue</p>
                  <p className="font-black text-white text-lg leading-tight">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="pt-1">
                  <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Registration Type</p>
                  <p className="font-black text-white text-lg capitalize">
                    {event.reg_type}
                    {event.reg_type === "team" && <span className="block text-sm text-zinc-400 font-medium mt-1">({event.min_team_size}-{event.max_team_size} members)</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 hidden lg:block">
              {isSuccessfullyRegistered ? (
                <div className="w-full flex flex-col items-center justify-center rounded-3xl bg-green-500/10 border border-green-500/20 p-6 text-green-400 text-center shadow-inner">
                  <div className="bg-green-500/20 p-3 rounded-full mb-3">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <span className="font-black text-xl mb-1 text-green-300">You're Registered!</span>
                  <Link href="/student/registrations" className="text-sm text-green-500 font-bold hover:text-green-300 transition-colors flex items-center gap-1 mt-2 bg-green-500/10 px-4 py-2 rounded-full">
                    <Ticket className="h-4 w-4" /> View Ticket
                  </Link>
                </div>
              ) : isClosed ? (
                <div className="w-full flex flex-col items-center justify-center rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-500 p-6 font-bold text-lg cursor-not-allowed">
                  <X className="h-8 w-8 mb-2 opacity-50" />
                  Registration Closed
                </div>
              ) : isFull ? (
                <div className="w-full flex flex-col items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 p-6 font-bold text-lg cursor-not-allowed">
                  <X className="h-8 w-8 mb-2 opacity-50" />
                  Registration Full
                </div>
              ) : (
                <button
                  onClick={handleRegisterClick}
                  className="w-full flex items-center justify-center gap-3 rounded-3xl bg-primary hover:bg-primary/90 text-primary-foreground p-5 font-black text-xl transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1"
                >
                  <Ticket className="h-6 w-6" />
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {isSuccessfullyRegistered ? (
          <Link
            href="/student/registrations"
            className="w-full flex items-center justify-center rounded-2xl bg-green-500/15 border border-green-500/30 text-green-400 py-4 font-black text-lg transition-all"
          >
            <CheckCircle className="mr-2 h-6 w-6" /> View Ticket
          </Link>
        ) : isClosed ? (
          <div className="w-full flex items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 py-4 font-black text-lg shadow-lg">
            Registration Closed
          </div>
        ) : isFull ? (
          <div className="w-full flex items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 py-4 font-black text-lg shadow-lg">
            Registration Full
          </div>
        ) : (
          <button
            onClick={handleRegisterClick}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-4 font-black text-lg shadow-xl shadow-primary/30"
          >
            <Ticket className="h-6 w-6" />
            Register Now
          </button>
        )}
      </div>

      {/* Full Poster Modal */}
      {showPosterModal && event.banner_url && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300"
          onClick={() => setShowPosterModal(false)}
        >
           <button 
             onClick={() => setShowPosterModal(false)}
             className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-colors border border-white/10"
           >
              <X className="h-6 w-6" />
           </button>
           <div className="relative w-full max-w-5xl aspect-auto max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Image
                src={event.banner_url}
                alt={event.title}
                width={1200}
                height={1600}
                className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
              />
              <a 
                href={event.banner_url} 
                target="_blank" 
                rel="noreferrer"
                className="mt-6 text-zinc-400 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors bg-white/5 px-6 py-2.5 rounded-full border border-white/5"
              >
                 Open Original Image
              </a>
           </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegModal && !isSuccessfullyRegistered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
              <h2 className="text-xl font-black text-white">Register for Event</h2>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8">
              <h3 className="text-2xl font-black mb-2 text-white leading-tight">{event.title}</h3>
              <p className="text-sm font-bold text-primary mb-8 tracking-wide uppercase">
                {event.reg_type === "team" ? "Team Registration" : "Individual Registration"}
              </p>

              {error && (
                <div className="mb-6 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3">
                  <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-8 rounded-2xl bg-green-500/10 border border-green-500/20 p-5 text-green-400 flex flex-col gap-3">
                  <div className="flex items-center gap-3 font-bold text-lg">
                    <CheckCircle className="h-6 w-6" />
                    <span>{success}</span>
                  </div>
                  {inviteCodeResult && teamMode === "create" && (
                    <div className="mt-4 bg-black/40 p-5 rounded-2xl border border-green-500/20 shadow-inner">
                      <p className="text-xs text-green-400/80 mb-3 font-black uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-4 w-4" /> Invite your crew members
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/5 rounded-xl p-2 border border-white/10">
                        <span className="text-2xl font-mono font-black tracking-[0.2em] text-white px-3 py-2 select-all text-center">
                          {inviteCodeResult}
                        </span>
                        <button 
                          onClick={() => handleCopyInviteLink(inviteCodeResult)}
                          className="bg-primary text-primary-foreground px-5 py-3 rounded-lg text-sm font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                          <Share2 className="h-4 w-4" /> Copy
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 mt-4 text-center font-medium">
                        Anyone with the link can directly join your team!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!success && (
                <form onSubmit={handleRegister} className="space-y-6">
                  {event.reg_type === "team" && (
                    <div className="space-y-6">
                      <div className="flex rounded-2xl bg-black/40 border border-white/5 p-1.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setTeamMode("create")}
                          className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                            teamMode === "create" ? "bg-primary text-primary-foreground shadow-lg" : "text-zinc-500 hover:text-white"
                          }`}
                        >
                          Create New Team
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeamMode("join")}
                          className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                            teamMode === "join" ? "bg-white/10 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                          }`}
                        >
                          Join Existing
                        </button>
                      </div>

                      {teamMode === "create" ? (
                        <div className="space-y-2.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Team Name</label>
                          <input
                            type="text"
                            required
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-medium focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-600"
                            placeholder="Enter an awesome team name"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Invite Code</label>
                          <input
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-mono text-lg text-center uppercase focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-600 placeholder:font-sans placeholder:text-sm"
                            placeholder="ENTER 6-CHAR CODE"
                            maxLength={10}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 py-4 font-black text-lg transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirm Registration"}
                  </button>
                </form>
              )}

              {success && (
                <button
                  onClick={handleCloseModal}
                  className="w-full mt-2 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 py-4 font-black text-lg transition-all"
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

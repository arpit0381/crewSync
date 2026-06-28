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
  is_paid?: boolean
  fee_amount?: number
  payment_qr_url?: string | null
  payment_remarks?: string | null
}

interface EventDetailsClientProps {
  event: EventDetails
  isRegistered: boolean
  registrationStatus?: string | null
  isLoggedIn: boolean
  isFull?: boolean
  isClosed?: boolean
}

export function EventDetailsClient({ event, isRegistered, registrationStatus, isLoggedIn, isFull, isClosed }: EventDetailsClientProps) {
  const [showRegModal, setShowRegModal] = React.useState(false)
  const [showPosterModal, setShowPosterModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [inviteCodeResult, setInviteCodeResult] = React.useState<string | null>(null)
  const [isSuccessfullyRegistered, setIsSuccessfullyRegistered] = React.useState(isRegistered)
  const [currentRegStatus, setCurrentRegStatus] = React.useState<string | null>(registrationStatus || null)

  // Team registration variables
  const [teamMode, setTeamMode] = React.useState<"create" | "join">("create")
  const [teamName, setTeamName] = React.useState("")
  const [inviteCode, setInviteCode] = React.useState("")
  const [isCopied, setIsCopied] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  
  // Payment variables
  const [paymentScreenshotFile, setPaymentScreenshotFile] = React.useState<File | null>(null)
  const [transactionId, setTransactionId] = React.useState("")

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

    let screenshotBase64 = undefined
    if (event.is_paid && (event.reg_type === "individual" || teamMode === "create")) {
      if (!paymentScreenshotFile) {
        setError("Payment screenshot is required for paid events.")
        setLoading(false)
        return
      }
      
      try {
        screenshotBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const img = new window.Image()
            img.onload = () => {
              const canvas = document.createElement("canvas")
              const MAX_WIDTH = 800
              const MAX_HEIGHT = 800
              let width = img.width
              let height = img.height
  
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width
                  width = MAX_WIDTH
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height
                  height = MAX_HEIGHT
                }
              }
              canvas.width = width
              canvas.height = height
              const ctx = canvas.getContext("2d")
              ctx?.drawImage(img, 0, 0, width, height)
              resolve(canvas.toDataURL("image/jpeg", 0.7))
            }
            img.onerror = reject
            img.src = e.target?.result as string
          }
          reader.onerror = reject
          reader.readAsDataURL(paymentScreenshotFile)
        })
      } catch(err) {
        setError("Error processing screenshot.")
        setLoading(false)
        return
      }
    }

    const result = await registerForEventAction(
      event.id,
      event.reg_type,
      event.reg_type === "team"
        ? {
            mode: teamMode,
            teamName: teamMode === "create" ? teamName : undefined,
            inviteCode: teamMode === "join" ? inviteCode : undefined,
          }
        : undefined,
      {
        screenshotBase64,
        transactionId
      }
    )

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success) {
      setSuccess(result.success)
      showToast(result.success)
      if (result.inviteCode) {
        setInviteCodeResult(result.inviteCode)
        if (teamMode === "create") {
          showToast("Awesome! Now invite more participants to your team.")
        }
      }
      setIsSuccessfullyRegistered(true)
      setCurrentRegStatus(result.paymentStatus || null)
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
    <div className="pb-32 lg:pb-16 min-h-screen relative selection:bg-primary/30 bg-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-primary/20">
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="pt-8 pb-8 flex items-center justify-between max-w-5xl mx-auto px-4 md:px-6">
        <Link 
          href="/student/events" 
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800"
        >
          {isCopied ? <Check className="mr-2 h-4 w-4 text-green-400" /> : <Share2 className="mr-2 h-4 w-4" />}
          {isCopied ? "Copied" : "Share"}
        </button>
      </div>

      {/* Main Content Area - Minimal & Clean */}
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          
          {/* Left Column: Details */}
          <div className="flex-1 min-w-0 w-full order-2 md:order-1 space-y-8">
            {/* Title & Badges */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {event.categories?.name || "Event"}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {event.reg_type === "team" ? `Team Event (${event.min_team_size}-${event.max_team_size})` : "Individual"}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] break-words">
                {event.title}
              </h1>
              
              <div className="flex items-center gap-2 text-zinc-400 text-base md:text-lg flex-wrap">
                <span>Organized by</span>
                <span className="text-zinc-200 font-medium break-words">{event.clubs?.name || event.departments?.name || "Campus Administration"}</span>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 border-y border-zinc-900">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Date</p>
                  <p className="text-sm font-medium text-zinc-200 truncate">{event.event_date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Time</p>
                  <p className="text-sm font-medium text-zinc-200 truncate">{event.event_time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Venue</p>
                  <p className="text-sm font-medium text-zinc-200 truncate">{event.venue}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Capacity</p>
                  <p className="text-sm font-medium text-zinc-200 truncate">{event.capacity} spots</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Entry Fee</p>
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {event.is_paid ? `₹${event.fee_amount}` : "Free"}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Action - Desktop */}
            <div className="hidden md:block pt-2">
              {isSuccessfullyRegistered ? (
                currentRegStatus === "pending_verification" ? (
                  <div className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20 w-auto text-center max-w-full">
                    <Clock className="h-5 w-5 shrink-0" />
                    <span className="truncate">Verification Pending</span>
                  </div>
                ) : (
                  <Link href="/student/registrations" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-green-500/10 text-green-400 font-semibold border border-green-500/20 hover:bg-green-500/20 transition-colors w-auto text-center max-w-full">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span className="truncate">You're Registered - View Ticket</span>
                  </Link>
                )
              ) : isClosed ? (
                 <div className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 text-zinc-500 font-semibold border border-zinc-800 cursor-not-allowed w-auto text-center max-w-full">
                   <X className="h-5 w-5 shrink-0" />
                   <span className="truncate">Registration Closed</span>
                 </div>
              ) : isFull ? (
                 <div className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-red-500/10 text-red-400 font-semibold border border-red-500/20 cursor-not-allowed w-auto text-center max-w-full">
                   <X className="h-5 w-5 shrink-0" />
                   <span className="truncate">Registration Full</span>
                 </div>
              ) : (
                 <button
                   onClick={handleRegisterClick}
                   className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-xl shadow-primary/20 w-auto max-w-full"
                 >
                   <Ticket className="h-5 w-5 shrink-0" />
                   <span className="truncate">Register Now</span>
                 </button>
              )}
            </div>

            {/* About Section */}
            <div className="pt-4 pb-10">
               <h2 className="text-lg font-bold text-white mb-4">
                 About the Event
               </h2>
               <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed text-sm md:text-base break-words">
                 <p className="whitespace-pre-wrap break-words">{event.description}</p>
               </div>
            </div>
          </div>

          {/* Right Column: Poster */}
          <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 order-1 md:order-2">
             {event.banner_url ? (
               <div 
                 className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-800/50 bg-zinc-950 group cursor-pointer shadow-2xl"
                 onClick={() => setShowPosterModal(true)}
               >
                 <Image
                   src={event.banner_url}
                   alt={event.title}
                   fill
                   className="object-cover transition-transform duration-700 group-hover:scale-105"
                   priority
                 />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <div className="bg-white/10 p-4 rounded-full backdrop-blur-md text-white shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                     <Maximize2 className="h-6 w-6" />
                   </div>
                 </div>
               </div>
             ) : (
               <div className="w-full aspect-[4/5] rounded-3xl border border-zinc-800/50 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-600 shadow-2xl">
                 <Image className="h-12 w-12 opacity-20 mb-4 grayscale" src="/placeholder.svg" alt="placeholder" width={48} height={48} />
                 <span className="text-sm font-medium tracking-wide uppercase">No Poster Available</span>
               </div>
             )}
          </div>

        </div>
      </div>

      {/* Floating Action Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {isSuccessfullyRegistered ? (
          currentRegStatus === "pending_verification" ? (
            <div className="w-full flex items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 py-4 font-black text-lg">
              <Clock className="mr-2 h-6 w-6 animate-pulse" /> Verification Pending
            </div>
          ) : (
            <Link
              href="/student/registrations"
              className="w-full flex items-center justify-center rounded-2xl bg-green-500/15 border border-green-500/30 text-green-400 py-4 font-black text-lg transition-all"
            >
              <CheckCircle className="mr-2 h-6 w-6" /> View Ticket
            </Link>
          )
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
          <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 shrink-0">
              <h2 className="text-xl font-black text-white">Register for Event</h2>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-70px)]">
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

                  {event.is_paid && (event.reg_type === "individual" || (event.reg_type === "team" && teamMode === "create")) && (
                    <div className="space-y-4 bg-primary/10 border border-primary/20 p-5 rounded-2xl animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                         <h4 className="text-white font-bold">Registration Fee</h4>
                         <span className="text-2xl font-black text-primary">₹{event.fee_amount}</span>
                      </div>
                      
                      {event.payment_qr_url && (
                        <div className="bg-white p-3 rounded-2xl w-48 mx-auto shadow-xl">
                          <Image src={event.payment_qr_url} alt="UPI QR" width={200} height={200} className="w-full h-auto object-contain rounded-lg" />
                        </div>
                      )}
                      
                      {event.payment_remarks && (
                        <p className="text-sm text-zinc-300 text-center font-medium bg-black/40 p-4 rounded-xl border border-white/5">{event.payment_remarks}</p>
                      )}

                      <div className="space-y-5 pt-4 border-t border-white/10">
                         <div className="space-y-2.5">
                           <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Payment Screenshot *</label>
                           <input
                             type="file"
                             accept="image/*"
                             required
                             onChange={(e) => setPaymentScreenshotFile(e.target.files?.[0] || null)}
                             className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-all"
                           />
                         </div>
                         <div className="space-y-2.5">
                           <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Transaction ID / UTR (Optional)</label>
                           <input
                             type="text"
                             value={transactionId}
                             onChange={(e) => setTransactionId(e.target.value)}
                             className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-all"
                             placeholder="e.g. 123456789012"
                           />
                         </div>
                         <div className="flex items-start gap-2.5 text-xs text-amber-400 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 font-medium leading-relaxed">
                           <Info className="h-4 w-4 shrink-0 mt-0.5" />
                           <p>
                             We will verify your registration. Once verified, you will get the ticket and a confirmation notification.
                           </p>
                         </div>
                      </div>
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

"use client"

import * as React from "react"
import { Bell, Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { broadcastNotificationAction } from "@/app/notification-actions"

const TEMPLATES = [
  {
    label: "Platform Announcement",
    title: "Campus Platform Update",
    message: "We have updated the Crew Sync platform with new features. Check out the latest events and tournaments!",
    type: "system"
  },
  {
    label: "Event Reminder",
    title: "Upcoming Event Reminder",
    message: "Don't forget! One of your registered events is starting soon. Make sure to check the venue and timings.",
    type: "event"
  },
  {
    label: "Urgent Alert",
    title: "Important Update",
    message: "Please note there has been a sudden change in schedule. Check the portal for the latest updates.",
    type: "alert"
  },
  {
    label: "Venue Relocation",
    title: "Urgent: Event Venue Shifted",
    message: "Attention participants! The venue for the upcoming event has been changed. Please check your dashboard tickets portal for the new venue assignment.",
    type: "alert"
  },
  {
    label: "Registration Closing",
    title: "Last Call: Registrations Closing Soon",
    message: "Hurry up! Registrations for the upcoming hackathon/tournament are closing in a few hours. Complete your team formations and seed your rosters now.",
    type: "event"
  },
  {
    label: "Pass Ready",
    title: "Entry Tickets & Passes Released",
    message: "Your entry passes are now active! Please navigate to the 'My Tickets' section on your student dashboard and download the PDF ticket or keep the QR code ready for check-in.",
    type: "event"
  },
  {
    label: "Roster Seeding Match",
    title: "Tournament Fixtures Published",
    message: "The official brackets and schedules have been drafted! Captains, please check the 'Tournament' page for your squad's match timings and pitch/court details.",
    type: "event"
  },
  {
    label: "Esports Credentials",
    title: "Esports Match Room Details Dispatched",
    message: "Lobby details are live! Check your tournament section for the custom Room ID and Room Password. Make sure to join the lobby 10 minutes prior to the schedule.",
    type: "event"
  },
  {
    label: "Attendance Verified",
    title: "Check-in Confirmed & Verified",
    message: "Welcome to the event! Your check-in attendance has been verified. Digital certificates will be auto-generated and made available on your dashboard upon completion.",
    type: "system"
  },
  {
    label: "Certificates Released",
    title: "Digital Certificates Available Now",
    message: "Congratulations! Verified PDF certificates for the recent campus event have been dispatched. You can view, download, or share them from your profile certificates page.",
    type: "system"
  },
  {
    label: "Results Announced",
    title: "Tournament Winners & Results Out",
    message: "The wait is over! The final brackets and team standings have been published. Big congratulations to all the winners and participants. Check the standings portal!",
    type: "system"
  },
  {
    label: "Maintenance Notice",
    title: "Scheduled Server Maintenance",
    message: "Crew Sync will undergo scheduled database optimizations tonight from 02:00 AM to 03:00 AM. Access passes and tickets verification will be offline during this period.",
    type: "system"
  },
  {
    label: "Feedback Survey",
    title: "Help Us Improve: Share Your Feedback",
    message: "Thank you for participating! Please take 2 minutes to fill out the event feedback questionnaire on your dashboard. Your review helps us host better student experiences.",
    type: "system"
  }
]

export function NotificationsManagerClient() {
  const [title, setTitle] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [type, setType] = React.useState("system")
  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState<{type: "success" | "error", text: string} | null>(null)

  const applyTemplate = (index: number) => {
    const t = TEMPLATES[index]
    setTitle(t.title)
    setMessage(t.message)
    setType(t.type)
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) return
    
    setLoading(true)
    setStatus(null)
    
    const res = await broadcastNotificationAction(title, message, type)
    
    if (res.error) {
      setStatus({ type: "error", text: res.error })
    } else {
      setStatus({ type: "success", text: `Successfully broadcasted notification to ${res.count} users.` })
      setTitle("")
      setMessage("")
      setType("system")
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="relative rounded-3xl bg-card border border-border p-6 md:p-8 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute -top-[40%] -right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary animate-pulse" />
            Broadcast Notifications
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Send platform-wide announcements, emergency alerts, or event check-in reminders to all registered student accounts instantly.
          </p>
        </div>
        <div className="hidden md:block relative w-44 h-28 shrink-0 z-10">
          <img 
            src="/icons/undraw_social-media-post_tg7l.svg" 
            alt="Broadcasting notifications illustration" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Templates */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Saved Templates</h2>
          <div className="grid gap-4 max-h-[580px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {TEMPLATES.map((t, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card/25 border-zinc-800/80 p-5 hover:bg-card/45 hover:border-primary/30 transition-all cursor-pointer shadow-sm select-none" onClick={() => applyTemplate(i)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{t.label}</span>
                  <span className="text-[10px] bg-muted px-2 py-1 rounded-md capitalize">{t.type}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{t.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Broadcast Form */}
        <div className="rounded-3xl border border-border bg-card/20 p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Send Custom Broadcast
          </h2>
          
          {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${status.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
              {status.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
              <span className="font-medium text-sm">{status.text}</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="system">System Announcement</option>
                <option value="event">Event Update</option>
                <option value="alert">Urgent Alert</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter notification title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]"
                placeholder="Enter the broadcast message..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 py-3.5 font-bold transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Broadcast Notification</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

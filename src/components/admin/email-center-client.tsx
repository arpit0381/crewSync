"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { Mail, Users, Calendar, User, Send, CheckCircle2, AlertCircle } from "lucide-react"
import { sendCustomAdminEmailAction } from "@/app/admin-email-actions"

interface EventBasic {
  id: string
  title: string
}

const EMAIL_TEMPLATES = [
  {
    id: "none",
    name: "Blank (Custom)",
    subject: "",
    body: ""
  },
  {
    id: "announcement",
    name: "Event Announcement",
    subject: "Announcing a New Event at Crew Sync!",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6;">Crew Sync</h2>
  <p>Hello Crew,</p>
  <p>We are excited to announce an upcoming event that you won't want to miss!</p>
  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1f2937;">[Event Name]</h3>
    <p style="margin: 0; color: #4b5563;">Date: [Date]</p>
    <p style="margin: 0; color: #4b5563;">Venue: [Location]</p>
  </div>
  <p>Make sure to register early to secure your spot. We look forward to seeing you there!</p>
  <br/>
  <a href="https://crewsync.formstuff.in/student/events" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Events & Register</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Team</p>
</div>`
  },
  {
    id: "reminder",
    name: "Event Reminder",
    subject: "Reminder: Upcoming Event Tomorrow",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6;">Crew Sync</h2>
  <p>Hi there,</p>
  <p>This is a quick reminder that you are registered for an upcoming event!</p>
  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1f2937;">[Event Name]</h3>
    <p style="margin: 0; color: #4b5563;">Date: [Date]</p>
    <p style="margin: 0; color: #4b5563;">Time: [Time]</p>
  </div>
  <p>Don't forget to bring your entry ticket QR code. See you soon!</p>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Team</p>
</div>`
  },
  {
    id: "welcome",
    name: "Welcome to Crew Sync",
    subject: "Welcome to Crew Sync!",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6;">Crew Sync</h2>
  <p>Welcome!</p>
  <p>We are thrilled to have you join Crew Sync, your central hub for all campus events, tournaments, and activities.</p>
  <p>Take a moment to complete your profile, explore upcoming events, and join teams to make the most of your experience.</p>
  <br/>
  <a href="https://crewsync.formstuff.in/student" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Team</p>
</div>`
  }
]

export function EmailCenterClient({ events }: { events: EventBasic[] }) {
  const [recipientType, setRecipientType] = useState<"all" | "event" | "specific">("all")
  const [eventId, setEventId] = useState("")
  const [specificEmail, setSpecificEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("none")
  
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tmplId = e.target.value
    setSelectedTemplate(tmplId)
    const tmpl = EMAIL_TEMPLATES.find(t => t.id === tmplId)
    if (tmpl && tmplId !== "none") {
      setSubject(tmpl.subject)
      setBody(tmpl.body)
    } else if (tmplId === "none") {
      setSubject("")
      setBody("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (recipientType === "event" && !eventId) {
      setMessage({ type: "error", text: "Please select an event." })
      return
    }
    if (recipientType === "specific" && !specificEmail) {
      setMessage({ type: "error", text: "Please enter a specific email address." })
      return
    }
    if (!subject || !body) {
      setMessage({ type: "error", text: "Please provide a subject and message body." })
      return
    }

    const formData = new FormData()
    formData.append("recipientType", recipientType)
    formData.append("eventId", eventId)
    formData.append("specificEmail", specificEmail)
    formData.append("subject", subject)
    formData.append("body", body)

    startTransition(async () => {
      const result = await sendCustomAdminEmailAction(formData)
      if (result?.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result?.success) {
        setMessage({ type: "success", text: result.success })
        setSubject("")
        setBody("")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Center</h2>
          <p className="text-muted-foreground">Send custom emails to users and event participants.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Recipient Type Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Select Recipients</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => setRecipientType("all")}
                  className={`cursor-pointer flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    recipientType === "all" ? "border-primary bg-primary/5" : "border-transparent bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Users className={`h-5 w-5 ${recipientType === "all" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">All Users</span>
                </div>
                
                <div 
                  onClick={() => setRecipientType("event")}
                  className={`cursor-pointer flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    recipientType === "event" ? "border-primary bg-primary/5" : "border-transparent bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Calendar className={`h-5 w-5 ${recipientType === "event" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Event Participants</span>
                </div>

                <div 
                  onClick={() => setRecipientType("specific")}
                  className={`cursor-pointer flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    recipientType === "specific" ? "border-primary bg-primary/5" : "border-transparent bg-muted hover:bg-muted/80"
                  }`}
                >
                  <User className={`h-5 w-5 ${recipientType === "specific" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Specific User</span>
                </div>
              </div>
            </div>

            {/* Conditional Inputs */}
            {recipientType === "event" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Event</label>
                <select 
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
            )}

            {recipientType === "specific" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email"
                  placeholder="user@example.com"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={specificEmail}
                  onChange={(e) => setSpecificEmail(e.target.value)}
                />
              </div>
            )}

            <hr />

            {/* Email Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Load a Template (Optional)</label>
                <select 
                  className="w-full rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                >
                  {EMAIL_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <input 
                  type="text"
                  placeholder="Email Subject"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Message Body</span>
                  <span className="text-xs text-muted-foreground font-normal">HTML is supported</span>
                </label>
                <textarea 
                  placeholder="<p>Hello,</p><p>Type your message here...</p>"
                  rows={8}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <p className="font-medium text-sm">{message.text}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="animate-spin text-xl">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Dispatch Email
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

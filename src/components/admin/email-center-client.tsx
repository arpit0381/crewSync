"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { Mail, Users, Calendar, User, Send, CheckCircle2, AlertCircle, Copy } from "lucide-react"
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
    name: "1. Event Announcement",
    subject: "Announcing a New Event at Crew Sync!",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6; margin-top: 0;">Crew Sync</h2>
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
    name: "2. Event Reminder",
    subject: "Reminder: Upcoming Event Tomorrow!",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6; margin-top: 0;">Crew Sync Reminder</h2>
  <p>Hi there,</p>
  <p>This is a quick reminder that you are registered for an upcoming event!</p>
  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1f2937;">[Event Name]</h3>
    <p style="margin: 0; color: #4b5563;">Date: [Date]</p>
    <p style="margin: 0; color: #4b5563;">Time: [Time]</p>
    <p style="margin: 0; color: #4b5563;">Venue: [Venue]</p>
  </div>
  <p>Don't forget to bring your entry ticket QR code (available under your Student Profile). See you soon!</p>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Team</p>
</div>`
  },
  {
    id: "welcome",
    name: "3. Welcome to Crew Sync",
    subject: "Welcome to Crew Sync - Your Campus Companion!",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6; margin-top: 0;">Welcome to Crew Sync!</h2>
  <p>Hello [User Name],</p>
  <p>We are thrilled to have you join Crew Sync, your central hub for all campus events, sports brackets, esports tournaments, and certification engines.</p>
  <p>Here are a few things you can do to get started:</p>
  <ul>
    <li>Explore upcoming sports & academic activities</li>
    <li>Form or join squads with invite codes</li>
    <li>Collect verified digital certificates</li>
  </ul>
  <br/>
  <a href="https://crewsync.formstuff.in/student" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Team</p>
</div>`
  },
  {
    id: "ticket",
    name: "4. Ticket & QR Code Dispatch",
    subject: "Your Entry Ticket is Ready - [Event Name]",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6; margin-top: 0;">Your Event Ticket</h2>
  <p>Hi [User Name],</p>
  <p>Your registration for <strong>[Event Name]</strong> has been confirmed! Your entry ticket is now generated and ready.</p>
  <div style="border: 2px dashed #3b82f6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; background-color: #f8fafc;">
    <span style="font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold; letter-spacing: 0.1em;">Ticket Code</span>
    <h1 style="margin: 5px 0; color: #1e3a8a; letter-spacing: 0.2em; font-family: monospace;">[Ticket Code]</h1>
    <p style="margin: 10px 0 0 0; font-size: 13px; color: #4b5563;">Scan this ticket code or show the QR code at the check-in counter.</p>
  </div>
  <p>You can view and download your full PDF ticket at any time from your registrations page.</p>
  <a href="https://crewsync.formstuff.in/student/registrations" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View My Tickets</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Team</p>
</div>`
  },
  {
    id: "esports",
    name: "5. Esports Lobby Credentials",
    subject: "Esports Lobby Created: [Tournament Name]",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #8b5cf6; margin-top: 0;">Lobby Dispatch Board</h2>
  <p>Hello Competitor,</p>
  <p>The custom lobby room for your upcoming match in <strong>[Tournament Name]</strong> has been created. Please use the following details to connect:</p>
  <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #4c1d95;"><strong>Lobby Room ID:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 16px;">[Room ID]</span></p>
    <p style="margin: 0; font-size: 14px; color: #4c1d95;"><strong>Lobby Password:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 16px;">[Password]</span></p>
  </div>
  <p style="color: #b45309; font-weight: bold; font-size: 13px;">⚠️ IMPORTANT: Do not share these credentials with anyone outside your squad. Unregistered players will be kicked immediately.</p>
  <p>Good luck in your matches!</p>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Esports League</p>
</div>`
  },
  {
    id: "certificate",
    name: "6. Certificate Issued Notification",
    subject: "Your Certificate for [Event Name] has been Issued!",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #10b981; margin-top: 0;">Certificate Issued</h2>
  <p>Congratulations [User Name],</p>
  <p>Your verified digital certificate for participation/achievements in <strong>[Event Name]</strong> has been generated and signed!</p>
  <div style="border: 1px solid #10b981; background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <p style="margin: 0; color: #065f46; font-weight: bold;">📜 Verified Certificate Ready for Download</p>
  </div>
  <p>You can view, verify, or download your PDF certificate on the Certificates page under your student dashboard.</p>
  <br/>
  <a href="https://crewsync.formstuff.in/student/certificates" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Certificates</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Certification Engine</p>
</div>`
  },
  {
    id: "match_schedule",
    name: "7. Match Schedule Alert",
    subject: "Match Scheduled: [Team 1] vs [Team 2] - [Tournament Name]",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6; margin-top: 0;">Match Schedule Alert</h2>
  <p>Hi Captain,</p>
  <p>Your squad's next fixture in <strong>[Tournament Name]</strong> has been officially scheduled:</p>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <h3 style="margin: 0; color: #1e293b;">[Team 1] <span style="color: #ef4444;">VS</span> [Team 2]</h3>
    <p style="margin: 8px 0 0 0; color: #4b5563; font-size: 13px;">Date: [Date] | Time: [Time]</p>
    <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 13px;">Location/Venue: [Venue]</p>
  </div>
  <p>Please make sure all team members report to the venue 15 minutes before the scheduled time. Walkovers will be awarded for late reporting.</p>
  <a href="https://crewsync.formstuff.in/tournament/brackets" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Tournament Brackets</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Operations</p>
</div>`
  },
  {
    id: "feedback",
    name: "8. Event Feedback Form",
    subject: "Tell us how we did! Feedback for [Event Name]",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6; margin-top: 0;">Your Feedback Matters</h2>
  <p>Hello event participant,</p>
  <p>Thank you for attending <strong>[Event Name]</strong>! We hope you had a fantastic and learning-filled experience.</p>
  <p>To help us make future campus events even better, please take 2 minutes to share your thoughts and rate the sessions.</p>
  <br/>
  <a href="https://crewsync.formstuff.in/student/events" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Submit Feedback Survey</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Team</p>
</div>`
  },
  {
    id: "team_invite",
    name: "9. Team Roster Invitation",
    subject: "Roster Invite: Join [Team Name] for [Event Name]",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #3b82f6; margin-top: 0;">Squad Roster Invitation</h2>
  <p>Hey there,</p>
  <p>Your classmate has invited you to join the squad <strong>[Team Name]</strong> to compete together in <strong>[Event Name]</strong>!</p>
  <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <p style="margin: 0; color: #0369a1; font-size: 12px; font-weight: bold; text-transform: uppercase;">Team Roster Invite Code</p>
    <h2 style="margin: 5px 0; color: #0284c7; font-family: monospace; letter-spacing: 0.15em;">[Invite Code]</h2>
  </div>
  <p>To accept the invite, click the button below, select "Join Team", and enter the roster invite code above.</p>
  <a href="https://crewsync.formstuff.in/events/[Event ID]" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invite & Join Team</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Team</p>
</div>`
  },
  {
    id: "payment_success",
    name: "10. Registration Payment Confirmed",
    subject: "Payment Confirmed: Registration Approved for [Event Name]",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #10b981; margin-top: 0;">Payment Approved</h2>
  <p>Hi [User Name],</p>
  <p>Your payment registration screenshot for the paid event <strong>[Event Name]</strong> has been verified and approved by the organizers!</p>
  <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0; color: #065f46; font-size: 14px;"><strong>Transaction Verified:</strong> Yes</p>
    <p style="margin: 4px 0 0 0; color: #065f46; font-size: 14px;"><strong>Registration Status:</strong> Active & Approved</p>
  </div>
  <p>You can now download your official entry pass PDF and checkout the schedules on your dashboard.</p>
  <a href="https://crewsync.formstuff.in/student/registrations" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Entry Pass</a>
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br/>Crew Sync Finance Board</p>
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
        setSelectedTemplate("none")
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
                  className="w-full rounded-md border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                >
                  <option value="" className="bg-background text-foreground">-- Choose an Event --</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id} className="bg-background text-foreground">{ev.title}</option>
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
                  className="w-full rounded-md border border-primary/30 bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                >
                  {EMAIL_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id} className="bg-background text-foreground">{tmpl.name}</option>
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

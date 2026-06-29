"use client"

import * as React from "react"
import QRCode from "qrcode"
import jsPDF from "jspdf"
import { Calendar, MapPin, Download, CheckCircle, Clock, X } from "lucide-react"

interface RegistrationData {
  registration_id: string
  created_at: string
  payment_status: string
  ticket: {
    id: string
    ticket_code: string
  } | null
  event: {
    id: string
    title: string
    description: string
    venue: string
    event_date: string
    event_time: string
    categories?: { name: string; type: string }
  }
}

interface TicketsClientProps {
  initialTickets: RegistrationData[]
  userName?: string
  userRoll?: string
  userEmail?: string
}

export function TicketsClient({ 
  initialTickets,
  userName = "Student",
  userRoll = "N/A",
  userEmail = ""
}: TicketsClientProps) {
  const [tickets, setTickets] = React.useState<RegistrationData[]>(initialTickets)
  const [qrUrls, setQrUrls] = React.useState<{ [key: string]: string }>({})

  // Generate QR code data URLs on mount
  React.useEffect(() => {
    tickets.forEach(async (t) => {
      if (!t.ticket) return
      
      try {
        const url = await QRCode.toDataURL(t.ticket.ticket_code, {
          margin: 1,
          width: 256,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        })
        setQrUrls((prev) => ({ ...prev, [t.ticket!.ticket_code]: url }))
      } catch (err) {
        console.error("Error generating QR:", err)
      }
    })
  }, [tickets])

  const downloadPDF = (t: RegistrationData, qrUrl: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    })

    const event = t.event
    if (!event || !t.ticket) return

    // 1. Rich Deep Dark Theme Background
    doc.setFillColor(10, 10, 12)
    doc.rect(0, 0, 148, 210, "F")

    // 2. Premium Outer Frame Accent (Indigo)
    doc.setDrawColor(79, 70, 229)
    doc.setLineWidth(0.8)
    doc.rect(8, 8, 132, 194)

    // 3. Header Ticket Accent (Indigo Banner)
    doc.setFillColor(79, 70, 229)
    doc.rect(8, 8, 132, 18, "F")

    // Brand Name & Pass Type
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text("CREW SYNC", 14, 15)
    doc.setFont("Helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(224, 231, 255)
    doc.text("CAMPUS EVENT ACCESS PASS", 14, 21)

    // Ticket Number (Top Right)
    doc.setFont("Courier", "bold")
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(t.ticket.ticket_code, 134, 18, { align: "right" })

    // 4. Attendee details section
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(129, 140, 248)
    doc.text("ATTENDEE IDENTITY", 14, 38)

    // Name & Roll No
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text(userName.toUpperCase(), 14, 46)

    doc.setFont("Helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`ROLL NO: ${userRoll}`, 14, 52)
    doc.text(`EMAIL: ${userEmail}`, 14, 56)

    // 5. Divider
    doc.setDrawColor(31, 41, 55)
    doc.setLineWidth(0.3)
    doc.line(12, 62, 136, 62)

    // 6. Event details section
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(129, 140, 248)
    doc.text("EVENT ACCESS PARAMETERS", 14, 72)

    // Event Title
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(15)
    doc.setTextColor(255, 255, 255)
    const splitTitle = doc.splitTextToSize(event.title, 118)
    doc.text(splitTitle, 14, 80)

    const titleLines = splitTitle.length || 1
    const detailsY = 80 + (titleLines * 6) + 4

    // Details Grid Layout
    // Column 1: Date & Venue
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text("DATE", 14, detailsY)
    doc.text("VENUE", 14, detailsY + 14)

    doc.setFont("Helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(event.event_date, 14, detailsY + 5)
    doc.setFont("Helvetica", "normal")
    const splitVenue = doc.splitTextToSize(event.venue, 55)
    doc.text(splitVenue, 14, detailsY + 19)

    // Column 2: Time & Category
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text("TIME", 78, detailsY)
    doc.text("CATEGORY / REG TYPE", 78, detailsY + 14)

    doc.setFont("Helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(event.event_time, 78, detailsY + 5)
    doc.setFont("Helvetica", "normal")
    const catName = event.categories?.name || "General"
    const regType = t.payment_status === "verified" ? "Verified Pass" : "Registered"
    doc.text(`${catName} (${regType})`, 78, detailsY + 19)

    // 7. Tear-off ticket stub line (Dotted)
    doc.setDrawColor(75, 85, 99)
    doc.setLineDashPattern([1.5, 1.5], 0)
    doc.setLineWidth(0.4)
    doc.line(8, 142, 140, 142)

    // Clear dash pattern
    doc.setLineDashPattern([], 0)

    // Tear tag text
    doc.setFont("Courier", "bold")
    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.text("GATE ENTRY VERIFICATION STUB", 74, 140, { align: "center" })

    // 8. QR Code Block
    if (qrUrl) {
      doc.setFillColor(255, 255, 255)
      doc.rect(53, 147, 42, 42, "F")
      doc.addImage(qrUrl, "PNG", 54, 148, 40, 40)
    }

    // Stub text info
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.text(event.title.toUpperCase(), 74, 195, { align: "center" })
    doc.setFont("Courier", "normal")
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`TICKET: ${t.ticket.ticket_code}`, 74, 200, { align: "center" })

    doc.save(`Ticket-${event.title.replace(/\s+/g, "-")}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">My Tickets & Registrations</h1>
        <p className="text-sm text-muted-foreground">View entry codes and download PDF cards for check-in verification.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
          <img 
            src="/icons/undraw_reading-time_jva3.svg" 
            alt="no tickets illustration" 
            className="w-44 h-44 object-contain opacity-75"
          />
          <div>
            <p className="font-semibold text-foreground">You have not registered for any events yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Go to Upcoming Events page to join.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((t) => {
            const event = t.event
            const qrUrl = t.ticket ? qrUrls[t.ticket.ticket_code] : null

            return (
              <div
                key={t.registration_id}
                className="flex flex-col md:flex-row rounded-3xl border border-border bg-card/85 overflow-hidden"
              >
                {/* Event summary details */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      {event?.categories?.name || "Event"}
                    </span>
                    <h3 className="text-lg font-bold text-foreground leading-tight">{event?.title || "Unknown Event"}</h3>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>{event?.event_date || "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span>{event?.event_time || "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>{event?.venue || "TBD"}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => qrUrl && event && downloadPDF(t, qrUrl)}
                      disabled={!qrUrl || !event}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-background border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-card hover:border-border transition-all disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* QR Display column */}
                <div className="border-t md:border-t-0 md:border-l border-border bg-background/40 p-6 flex flex-col items-center justify-center min-w-[160px]">
                  {t.payment_status === "pending_verification" ? (
                    <div className="text-center space-y-3 p-2 animate-in fade-in duration-300">
                      <div className="mx-auto bg-amber-500/10 p-3 rounded-full w-fit">
                        <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pending</p>
                        <p className="text-[10px] text-muted-foreground mt-1 px-2">Payment verification in progress</p>
                      </div>
                    </div>
                  ) : t.payment_status === "rejected" ? (
                    <div className="text-center space-y-3 p-2 animate-in fade-in duration-300">
                      <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit">
                        <X className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Rejected</p>
                        <p className="text-[10px] text-muted-foreground mt-1 px-2">Payment screenshot was rejected. Please contact support.</p>
                      </div>
                    </div>
                  ) : qrUrl ? (
                    <div className="space-y-2 text-center">
                      <div className="rounded-2xl bg-white p-2">
                        <img src={qrUrl} alt="QR Code" loading="lazy" className="h-28 w-28" />
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground">{t.ticket?.ticket_code}</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-xs text-center flex flex-col items-center gap-2">
                      <div className="h-10 w-10 border-2 border-dashed border-border rounded-full animate-spin border-t-transparent" />
                      <span>Generating QR...</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

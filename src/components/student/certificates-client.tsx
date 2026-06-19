"use client"

import * as React from "react"
import jsPDF from "jspdf"
import { claimCertificateAction } from "@/app/certificate-actions"
import { Award, Download, Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react"

interface Certificate {
  id?: string // Claimed cert ID
  event_id: string
  event_title: string
  event_date: string
  cert_type?: "participation" | "winner" | "runner_up"
  claimed: boolean
  attendance_verified: boolean
  template_url?: string | null
  title_coords?: { x: number; y: number; fontSize: number } | null
  name_coords?: { x: number; y: number; fontSize: number } | null
  date_coords?: { x: number; y: number; fontSize: number } | null
}

interface CertificatesClientProps {
  initialCertificates: Certificate[]
}

export function CertificatesClient({ initialCertificates }: CertificatesClientProps) {
  const [certs, setCerts] = React.useState<Certificate[]>(initialCertificates)
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleClaim = async (eventId: string, index: number) => {
    setLoadingId(eventId)
    setError(null)

    const result = await claimCertificateAction(eventId, "participation")

    if (result.error) {
      setError(result.error)
    } else if (result.success && result.cert) {
      setCerts(
        certs.map((c, i) =>
          i === index
            ? {
                ...c,
                claimed: true,
                id: result.cert.id,
                cert_type: result.cert.cert_type as any
              }
            : c
        )
      )
    }
    setLoadingId(null)
  }

  const generatePDFCertificate = async (c: Certificate, studentName: string) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4", // Standard landscape certificate
    })

    const w = 297
    const h = 210

    if (c.template_url) {
      // 1. Load custom background image template from Cloudinary
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image()
          image.crossOrigin = "anonymous" // Prevent CORS issues with Cloudinary CDN
          image.onload = () => resolve(image)
          image.onerror = (err) => reject(err)
          image.src = c.template_url!
        })

        // Draw background template image
        doc.addImage(img, "JPEG", 0, 0, w, h)
      } catch (err) {
        console.error("Error loading template image:", err)
        throw new Error("Failed to load certificate template image")
      }

      // 2. Overlay texts at configured coordinates
      // Title
      if (c.title_coords) {
        doc.setFont("Times", "italic")
        doc.setFontSize(c.title_coords.fontSize || 28)
        doc.setTextColor(212, 175, 55) // Gold
        doc.text("Certificate of Completion", c.title_coords.x, c.title_coords.y, { align: "center" })
      }

      // Student Name
      if (c.name_coords) {
        doc.setFont("Times", "bold")
        doc.setFontSize(c.name_coords.fontSize || 32)
        doc.setTextColor(255, 255, 255)
        doc.text(studentName, c.name_coords.x, c.name_coords.y, { align: "center" })
      }

      // Date
      if (c.date_coords) {
        doc.setFont("Helvetica", "normal")
        doc.setFontSize(c.date_coords.fontSize || 10)
        doc.setTextColor(180, 180, 180)
        doc.text(`Given on: ${c.event_date}`, w / 2, c.date_coords.y, { align: "center" })
      }

      // Fallbacks if some coordinates are missing
      if (!c.title_coords && !c.name_coords && !c.date_coords) {
        doc.setFont("Times", "bold")
        doc.setFontSize(32)
        doc.setTextColor(255, 255, 255)
        doc.text(studentName, w / 2, h / 2, { align: "center" })
      }
    } else {
      // 1. Draw elegant border
      // Dark outer frame
      doc.setFillColor(15, 15, 17)
      doc.rect(0, 0, w, h, "F")

      // Double thin gold borders
      doc.setDrawColor(212, 175, 55) // Gold
      doc.setLineWidth(1.5)
      doc.rect(10, 10, w - 20, h - 20)
      
      doc.setLineWidth(0.5)
      doc.rect(12, 12, w - 24, h - 24)

      // Corner decorative gold triangles
      doc.setFillColor(212, 175, 55)
      // Top-Left corner
      doc.triangle(12, 12, 25, 12, 12, 25, "FD")
      // Top-Right corner
      doc.triangle(w - 12, 12, w - 25, 12, w - 12, 25, "FD")
      // Bottom-Left corner
      doc.triangle(12, h - 12, 25, h - 12, 12, h - 25, "FD")
      // Bottom-Right corner
      doc.triangle(w - 12, h - 12, w - 25, h - 12, w - 12, h - 25, "FD")

      // 2. Text layout
      // Title
      doc.setFont("Times", "italic")
      doc.setFontSize(28)
      doc.setTextColor(212, 175, 55) // Gold
      doc.text("Certificate of Completion", w / 2, 45, { align: "center" })

      // Subtitle
      doc.setFont("Helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(180, 180, 180)
      doc.text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", w / 2, 65, { align: "center" })

      // Student Name
      doc.setFont("Times", "bold")
      doc.setFontSize(32)
      doc.setTextColor(255, 255, 255)
      doc.text(studentName, w / 2, 85, { align: "center" })

      // Underline name
      doc.setDrawColor(100, 100, 100)
      doc.setLineWidth(0.5)
      doc.line(70, 92, w - 70, 92)

      // Purpose text
      doc.setFont("Helvetica", "normal")
      doc.setFontSize(12)
      doc.setTextColor(180, 180, 180)
      
      const typeLabel = c.cert_type === "winner" ? "winner" : c.cert_type === "runner_up" ? "runner up" : "active participant"
      doc.text(
        `for outstanding performance and completion as a verified ${typeLabel}`,
        w / 2,
        105,
        { align: "center" }
      )
      
      doc.setFont("Helvetica", "bold")
      doc.setTextColor(255, 255, 255)
      doc.text(`"${c.event_title}"`, w / 2, 118, { align: "center" })

      // Date
      doc.setFont("Helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Given on: ${c.event_date}`, w / 2, 138, { align: "center" })

      // Signatures placeholders
      doc.setDrawColor(100, 100, 100)
      doc.line(45, 170, 105, 170)
      doc.line(w - 105, 170, w - 45, 170)

      doc.setFontSize(9)
      doc.text("Event Coordinator", 75, 178, { align: "center" })
      doc.text("Campus Director", w - 75, 178, { align: "center" })
    }

    // Verification ID badge
    doc.setFont("Helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text(`VERIFICATION ID: CA-CERT-${c.id?.substring(0, 8).toUpperCase() || "MOCK-ID"}`, w / 2, 195, { align: "center" })

    doc.save(`Certificate-${c.event_title.replace(/\s+/g, "-")}.pdf`)
  }

  // Get name from localStorage or session
  const getStudentName = () => {
    if (typeof window !== "undefined") {
      // Mock or try to fetch user metadata from local storage
      return "Arpit Bajpai"
    }
    return "Student"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">My Certificates</h1>
        <p className="text-sm text-zinc-400">Claim and download verified completion, winner, or volunteer certificates.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {certs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
          <Award className="h-12 w-12 mx-auto text-zinc-700 stroke-[1.5] mb-2" />
          <p>No certificates available.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Certificates will become claimable after event organizers mark your attendance check-in.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certs.map((c, index) => (
            <div
              key={c.event_id}
              className={`rounded-3xl border p-6 flex items-start gap-4 transition-all ${
                c.claimed 
                  ? "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700" 
                  : c.attendance_verified 
                    ? "bg-zinc-900/20 border-zinc-800 border-dashed" 
                    : "bg-zinc-950/50 border-zinc-900 opacity-60"
              }`}
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                c.claimed 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : c.attendance_verified 
                    ? "bg-primary/10 border-primary/20 text-primary" 
                    : "bg-zinc-950 border-zinc-850 text-zinc-600"
              }`}>
                <Award className="h-6 w-6" />
              </div>

              <div className="space-y-3 flex-1 overflow-hidden">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white leading-tight truncate">{c.event_title}</h3>
                  <p className="text-xs text-zinc-500">Attended on: {c.event_date}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">
                    {c.claimed ? "Verified Certificate" : c.attendance_verified ? "Unclaimed" : "Attendance Pending"}
                  </span>

                  {c.claimed ? (
                    <button
                      onClick={async () => {
                        setLoadingId(c.event_id + "-download")
                        try {
                          await generatePDFCertificate(c, getStudentName())
                        } catch (err) {
                          console.error("PDF generation failed:", err)
                          setError("Failed to download template. Please check connection.")
                        } finally {
                          setLoadingId(null)
                        }
                      }}
                      disabled={loadingId === c.event_id + "-download"}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-900 transition-all disabled:opacity-50"
                    >
                      {loadingId === c.event_id + "-download" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download A4
                    </button>
                  ) : c.attendance_verified ? (
                    <button
                      onClick={() => handleClaim(c.event_id, index)}
                      disabled={loadingId === c.event_id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-50"
                    >
                      {loadingId === c.event_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Claim Certificate
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-zinc-600">
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

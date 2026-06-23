"use client"

import * as React from "react"
import jsPDF from "jspdf"
import QRCode from "qrcode"
import { claimCertificateAction } from "@/app/certificate-actions"
import { renderThemeToPDF, getThemeById, type CertificateData } from "@/lib/certificate-themes"
import { getCertTypeLabel, formatCertDate } from "@/lib/certificate-utils"
import {
  Award, Download, Lock, CheckCircle2, Loader2, AlertCircle,
  Search, Grid3X3, List, ExternalLink, Copy, Check, Filter
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────
interface Certificate {
  id?: string
  event_id: string
  event_title: string
  event_date: string
  cert_type?: "participation" | "winner" | "runner_up"
  claimed: boolean
  attendance_verified: boolean
  certificate_number?: string | null
  verification_url?: string | null
  // V2 template data
  theme_id: string
  cert_title: string
  cert_subtitle: string
  description: string
  signatory_left_name: string
  signatory_left_title: string
  signatory_right_name: string
  signatory_right_title: string
  include_qr: boolean
  template_published: boolean
}

interface CertificatesClientProps {
  initialCertificates: Certificate[]
  studentName: string
}

// ─── Component ──────────────────────────────────────────────────────
export function CertificatesClient({ initialCertificates, studentName }: CertificatesClientProps) {
  const [certs, setCerts] = React.useState<Certificate[]>(initialCertificates)
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [search, setSearch] = React.useState("")
  const [filterType, setFilterType] = React.useState<string>("all")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Stats
  const totalCerts = certs.filter((c) => c.claimed).length
  const recentCerts = certs.filter((c) => c.claimed).slice(0, 3)

  // Filtered
  const filtered = certs.filter((c) => {
    const matchesSearch = c.event_title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filterType === "all" || c.cert_type === filterType || (!c.claimed && filterType === "pending")
    return matchesSearch && matchesFilter
  })

  // ─── Claim Certificate ──────────────────────────────────────────
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
                cert_type: result.cert.cert_type as any,
                certificate_number: result.cert.certificate_number,
                verification_url: result.cert.verification_url,
              }
            : c
        )
      )
    }
    setLoadingId(null)
  }

  // ─── Generate PDF ───────────────────────────────────────────────
  const handleDownload = async (c: Certificate) => {
    setLoadingId(c.event_id + "-download")
    setError(null)

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Generate QR code data URL if needed
      let qrDataUrl: string | undefined
      if (c.include_qr && c.verification_url) {
        try {
          qrDataUrl = await QRCode.toDataURL(c.verification_url, {
            width: 200,
            margin: 1,
            color: { dark: "#000000", light: "#ffffff" },
          })
        } catch {
          // QR generation failed — continue without it
        }
      }

      const data: CertificateData = {
        studentName,
        eventName: c.event_title,
        eventDate: formatCertDate(c.event_date),
        issueDate: formatCertDate(new Date().toISOString()),
        certType: c.cert_type || "participation",
        certTitle: c.cert_title,
        certSubtitle: c.cert_subtitle,
        description: c.description,
        signatoryLeftName: c.signatory_left_name,
        signatoryLeftTitle: c.signatory_left_title,
        signatoryRightName: c.signatory_right_name,
        signatoryRightTitle: c.signatory_right_title,
        certificateNumber: c.certificate_number || `CA-${c.id?.substring(0, 8).toUpperCase() || "DRAFT"}`,
        verificationUrl: c.verification_url || undefined,
        includeQr: c.include_qr,
        qrDataUrl,
      }

      renderThemeToPDF(doc, c.theme_id, data)
      doc.save(`Certificate-${c.event_title.replace(/\s+/g, "-")}.pdf`)
    } catch (err) {
      console.error("PDF generation failed:", err)
      setError("Failed to generate certificate PDF. Please try again.")
    } finally {
      setLoadingId(null)
    }
  }

  // ─── Copy Verification Link ────────────────────────────────────
  const handleCopyLink = (certId: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(certId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">My Certificates</h1>
          <p className="text-sm text-muted-foreground">Claim, download, and share your verified certificates.</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/20 px-4 py-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{totalCerts}</span>
            <span className="text-xs text-muted-foreground">Earned</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificates..."
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {["all", "participation", "winner", "runner_up", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer capitalize ${
                filterType === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "runner_up" ? "Runner Up" : f}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex rounded-xl border border-border bg-card p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center">
          <Award className="h-14 w-14 mx-auto text-muted-foreground stroke-[1.2] mb-3" />
          <p className="text-lg font-bold text-foreground">No Certificates Yet</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Certificates will appear here after you attend events and organizers publish certificate designs. Keep participating!
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* ─── Grid View ──────────────────────────────────────────── */
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, index) => {
            const theme = getThemeById(c.theme_id)
            return (
              <div
                key={c.event_id}
                className={`rounded-3xl border overflow-hidden transition-all group ${
                  c.claimed
                    ? "border-border bg-card/20 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                    : c.attendance_verified
                      ? "border-dashed border-border bg-card/10"
                      : "border-border bg-background/50 opacity-60"
                }`}
              >
                {/* Theme strip */}
                <div className={`h-2 ${theme.preview.bgClass}`}>
                  <div className={`h-full w-1/3 ${c.claimed ? "bg-primary/40" : "bg-transparent"}`} />
                </div>

                <div className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                        {c.event_title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">{formatCertDate(c.event_date)}</p>
                    </div>
                    <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border ${
                      c.claimed
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : c.attendance_verified
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-muted border-border text-muted-foreground"
                    }`}>
                      <Award className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Cert type badge + number */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.cert_type && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                        {getCertTypeLabel(c.cert_type)}
                      </span>
                    )}
                    {c.certificate_number && (
                      <span className="text-[9px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {c.certificate_number}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    {c.claimed ? (
                      <>
                        <button
                          onClick={() => handleDownload(c)}
                          disabled={loadingId === c.event_id + "-download"}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-card border border-border px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all disabled:opacity-50"
                        >
                          {loadingId === c.event_id + "-download" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          PDF
                        </button>
                        {c.verification_url && (
                          <>
                            <button
                              onClick={() => handleCopyLink(c.id!, c.verification_url!)}
                              className="flex items-center justify-center gap-1 rounded-xl bg-card border border-border px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
                            >
                              {copiedId === c.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                            <a
                              href={c.verification_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center rounded-xl bg-card border border-border px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </>
                        )}
                      </>
                    ) : c.attendance_verified ? (
                      <button
                        onClick={() => handleClaim(c.event_id, index)}
                        disabled={loadingId === c.event_id}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-50"
                      >
                        {loadingId === c.event_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Claim Certificate
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground py-2.5">
                        <Lock className="h-3.5 w-3.5" /> Attendance Pending
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ─── List View ──────────────────────────────────────────── */
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-card/30">
                <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider">Event</th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Cert Number</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, index) => (
                <tr key={c.event_id} className="border-b border-border/50 hover:bg-card/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{c.event_title}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatCertDate(c.event_date)}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {c.cert_type ? (
                      <span className="text-[9px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                        {getCertTypeLabel(c.cert_type)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground hidden lg:table-cell">
                    {c.certificate_number || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.claimed ? (
                      <button
                        onClick={() => handleDownload(c)}
                        disabled={loadingId === c.event_id + "-download"}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-card border border-border px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all disabled:opacity-50"
                      >
                        {loadingId === c.event_id + "-download" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Download
                      </button>
                    ) : c.attendance_verified ? (
                      <button
                        onClick={() => handleClaim(c.event_id, index)}
                        disabled={loadingId === c.event_id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-all disabled:opacity-50"
                      >
                        {loadingId === c.event_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Claim
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

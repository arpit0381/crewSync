"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award, Check, ChevronRight, Loader2, Palette, Type, Eye, Send,
  Monitor, Tablet, Smartphone, Maximize2, CheckCircle2, Users,
  Zap, QrCode, Hash, X, AlertCircle, Download
} from "lucide-react"
import { CERTIFICATE_THEMES, getThemeById, type CertificateTheme } from "@/lib/certificate-themes"
import { saveCertificateDesignAction, bulkGenerateCertificatesAction, generateAllCertificatesAction } from "@/app/certificate-actions"

// ─── Types ──────────────────────────────────────────────────────────
interface Event {
  id: string
  title: string
  event_date: string
  status: string
  categories?: { name: string }
}

interface Template {
  id: string
  event_id: string
  theme_id?: string
  cert_title?: string
  cert_subtitle?: string
  description?: string
  signatory_left_name?: string
  signatory_left_title?: string
  signatory_right_name?: string
  signatory_right_title?: string
  cert_number_format?: string
  auto_generate?: boolean
  include_qr?: boolean
  status?: string
}

interface AttendeeInfo {
  userId: string
  name: string
  email: string
  rollNumber: string
}

interface CertRecord {
  id: string
  user_id: string
  cert_type: string
  certificate_number: string
  generated_at: string
}

interface Props {
  events: Event[]
  templates: Template[]
  attendanceMap: Record<string, AttendeeInfo[]>
  certificatesMap: Record<string, CertRecord[]>
}

const STEPS = [
  { label: "Design", sub: "Choose theme & design", icon: Palette },
  { label: "Content", sub: "Configure details", icon: Type },
  { label: "Preview", sub: "Review certificate", icon: Eye },
  { label: "Publish", sub: "Approve & generate", icon: Send },
]

const THEME_CATEGORIES = ["All", "Professional", "Creative", "Minimal", "Energetic"] as const

// ─── Component ──────────────────────────────────────────────────────
export function CertificateDesignerClient({ events, templates, attendanceMap, certificatesMap }: Props) {
  // State
  const [step, setStep] = React.useState(0)
  const [selectedEventId, setSelectedEventId] = React.useState(events[0]?.id || "")
  const [themeFilter, setThemeFilter] = React.useState<string>("All")
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop")
  const [fullscreen, setFullscreen] = React.useState(false)

  // Form state
  const [selectedTheme, setSelectedTheme] = React.useState("modern-gold")
  const [certTitle, setCertTitle] = React.useState("Certificate of Completion")
  const [certSubtitle, setCertSubtitle] = React.useState("PROUDLY PRESENTED TO")
  const [description, setDescription] = React.useState("for participation in the campus event")
  const [sigLeftName, setSigLeftName] = React.useState("Coordinator")
  const [sigLeftTitle, setSigLeftTitle] = React.useState("Event Coordinator")
  const [sigRightName, setSigRightName] = React.useState("Director")
  const [sigRightTitle, setSigRightTitle] = React.useState("Campus Director")
  const [certNumberFormat, setCertNumberFormat] = React.useState("CRA-2026-{{event_id}}-{{user_id}}")
  const [autoGenerate, setAutoGenerate] = React.useState(true)
  const [includeQr, setIncludeQr] = React.useState(true)

  // Action state
  const [saving, setSaving] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = React.useState<Set<string>>(new Set())

  // Load existing template when event changes
  React.useEffect(() => {
    const existing = templates.find((t) => t.event_id === selectedEventId)
    if (existing) {
      setSelectedTheme(existing.theme_id || "modern-gold")
      setCertTitle(existing.cert_title || "Certificate of Completion")
      setCertSubtitle(existing.cert_subtitle || "PROUDLY PRESENTED TO")
      setDescription(existing.description || "for participation in the campus event")
      setSigLeftName(existing.signatory_left_name || "Coordinator")
      setSigLeftTitle(existing.signatory_left_title || "Event Coordinator")
      setSigRightName(existing.signatory_right_name || "Director")
      setSigRightTitle(existing.signatory_right_title || "Campus Director")
      setCertNumberFormat(existing.cert_number_format || "CRA-2026-{{event_id}}-{{user_id}}")
      setAutoGenerate(existing.auto_generate ?? true)
      setIncludeQr(existing.include_qr ?? true)
    }
  }, [selectedEventId, templates])

  const currentEvent = events.find((e) => e.id === selectedEventId)
  const eligible = attendanceMap[selectedEventId] || []
  const generated = certificatesMap[selectedEventId] || []
  const generatedUserIds = new Set(generated.map((c) => c.user_id))
  const pendingUsers = eligible.filter((a) => !generatedUserIds.has(a.userId))

  const theme = getThemeById(selectedTheme)

  const filteredThemes = themeFilter === "All"
    ? CERTIFICATE_THEMES
    : CERTIFICATE_THEMES.filter((t) => t.category === themeFilter.toLowerCase())

  // ─── Save Design ────────────────────────────────────────────────
  const handleSave = async (status: string) => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.set("event_id", selectedEventId)
    formData.set("theme_id", selectedTheme)
    formData.set("cert_title", certTitle)
    formData.set("cert_subtitle", certSubtitle)
    formData.set("description", description)
    formData.set("signatory_left_name", sigLeftName)
    formData.set("signatory_left_title", sigLeftTitle)
    formData.set("signatory_right_name", sigRightName)
    formData.set("signatory_right_title", sigRightTitle)
    formData.set("cert_number_format", certNumberFormat)
    formData.set("auto_generate", String(autoGenerate))
    formData.set("include_qr", String(includeQr))
    formData.set("status", status)

    const result = await saveCertificateDesignAction(formData)
    if (result.error) setError(result.error)
    else setSuccess(result.success || "Saved!")
    setSaving(false)
  }

  // ─── Bulk Generate ──────────────────────────────────────────────
  const handleBulkGenerate = async (userIds: string[]) => {
    setGenerating(true)
    setError(null)
    setSuccess(null)

    const result = await bulkGenerateCertificatesAction(selectedEventId, userIds)
    if (result.error) setError(result.error)
    else setSuccess(result.success || "Generated!")
    setGenerating(false)
  }

  const handleGenerateAll = async () => {
    setGenerating(true)
    setError(null)
    setSuccess(null)

    const result = await generateAllCertificatesAction(selectedEventId)
    if (result.error) setError(result.error)
    else setSuccess(result.success || "Generated!")
    setGenerating(false)
  }

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const toggleAllUsers = () => {
    if (selectedUsers.size === pendingUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(pendingUsers.map((u) => u.userId)))
    }
  }

  // ─── Preview dimensions ──────────────────────────────────────────
  const previewScale = previewDevice === "desktop" ? "w-full" : previewDevice === "tablet" ? "max-w-[500px]" : "max-w-[320px]"

  // ─── Theme Preview Card (mini certificate) ──────────────────────
  const ThemeCard = ({ t, isSelected }: { t: CertificateTheme; isSelected: boolean }) => (
    <button
      onClick={() => setSelectedTheme(t.id)}
      className={`group relative rounded-2xl border-2 p-3 transition-all duration-200 text-left cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
          : "border-border/60 hover:border-border bg-card/20 hover:bg-card/40"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
          <Check className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
      {/* Mini preview */}
      <div className={`w-full aspect-[1.41] rounded-lg ${t.preview.bgClass} border ${t.preview.borderClass} p-3 flex flex-col items-center justify-center gap-1 mb-2 overflow-hidden`}>
        <span className={`text-[7px] font-serif italic ${t.preview.titleClass} truncate`}>Certificate</span>
        <span className={`text-[5px] uppercase tracking-widest ${t.preview.accentClass}`}>presented to</span>
        <span className={`text-[9px] font-bold ${t.preview.nameClass}`}>Student Name</span>
        <div className={`w-8 h-[1px] ${t.preview.borderClass}`} />
      </div>
      <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
      <p className="text-[10px] text-muted-foreground capitalize">{t.category}</p>
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Certificate Management</h1>
          <p className="text-sm text-muted-foreground">Create, customize and manage beautiful certificates</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => { setSelectedEventId(e.target.value); setStep(0); setSuccess(null); setError(null) }}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none transition-all min-w-[200px]"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Save Draft
          </button>
          <button
            onClick={() => { if (step < 3) setStep(step + 1); else handleSave("published") }}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all"
          >
            {step < 3 ? (
              <>Next Step <ChevronRight className="h-3.5 w-3.5" /></>
            ) : (
              <>{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Publish</>
            )}
          </button>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = step === i
          const isDone = step > i
          return (
            <React.Fragment key={i}>
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" :
                  isDone ? "bg-primary/10 text-primary" :
                  "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  isActive ? "bg-primary-foreground/20" : isDone ? "bg-primary/20" : "bg-muted"
                }`}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-extrabold">{s.label}</p>
                  <p className={`text-[9px] font-normal ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{s.sub}</p>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-[2px] w-6 md:w-12 mx-1 rounded-full transition-colors ${step > i ? "bg-primary" : "bg-border"}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {error && (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                <button onClick={() => setError(null)} className="ml-auto"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
                <button onClick={() => setSuccess(null)} className="ml-auto"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── Step 0: Design (Theme Selection) ────────────────────── */}
        {step === 0 && (
          <>
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">Choose Theme</h2>
              </div>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5">
                {THEME_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setThemeFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      themeFilter === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Theme Grid */}
              <div className="grid grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredThemes.map((t) => (
                  <ThemeCard key={t.id} t={t} isSelected={selectedTheme === t.id} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-8">
              <CertificatePreview
                theme={theme}
                certTitle={certTitle}
                certSubtitle={certSubtitle}
                description={description}
                eventName={currentEvent?.title || "Event Name"}
                sigLeftName={sigLeftName}
                sigLeftTitle={sigLeftTitle}
                sigRightName={sigRightName}
                sigRightTitle={sigRightTitle}
                previewDevice={previewDevice}
                setPreviewDevice={setPreviewDevice}
                fullscreen={fullscreen}
                setFullscreen={setFullscreen}
              />
            </div>
          </>
        )}

        {/* ── Step 1: Content Configuration ───────────────────────── */}
        {step === 1 && (
          <>
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">Certificate Content</h2>
              <p className="text-xs text-muted-foreground -mt-2">All fields with <span className="text-primary font-bold">Auto</span> tags are auto-filled from event data.</p>

              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
                {/* Title */}
                <FieldGroup label="Certificate Title">
                  <input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} className="input-field" />
                </FieldGroup>

                {/* Subtitle */}
                <FieldGroup label="Presented To (Label)">
                  <input value={certSubtitle} onChange={(e) => setCertSubtitle(e.target.value)} className="input-field" />
                </FieldGroup>

                {/* Recipient */}
                <FieldGroup label="Recipient Name">
                  <div className="flex items-center gap-2">
                    <input value="{{student_name}}" readOnly className="input-field flex-1 opacity-70" />
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg shrink-0">Auto</span>
                  </div>
                </FieldGroup>

                {/* Description */}
                <FieldGroup label="Description">
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input-field resize-none" />
                </FieldGroup>

                {/* Event Name */}
                <FieldGroup label="Event Name">
                  <div className="flex items-center gap-2">
                    <input value="{{event_name}}" readOnly className="input-field flex-1 opacity-70" />
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg shrink-0">Auto</span>
                  </div>
                </FieldGroup>

                {/* Event Date */}
                <FieldGroup label="Event Date">
                  <div className="flex items-center gap-2">
                    <input value="{{event_date}}" readOnly className="input-field flex-1 opacity-70" />
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg shrink-0">Auto</span>
                  </div>
                </FieldGroup>

                {/* Signatures */}
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-3">Signatures</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Left Signatory">
                      <input value={sigLeftName} onChange={(e) => setSigLeftName(e.target.value)} className="input-field" />
                    </FieldGroup>
                    <FieldGroup label="Left Designation">
                      <input value={sigLeftTitle} onChange={(e) => setSigLeftTitle(e.target.value)} className="input-field" />
                    </FieldGroup>
                    <FieldGroup label="Right Signatory">
                      <input value={sigRightName} onChange={(e) => setSigRightName(e.target.value)} className="input-field" />
                    </FieldGroup>
                    <FieldGroup label="Right Designation">
                      <input value={sigRightTitle} onChange={(e) => setSigRightTitle(e.target.value)} className="input-field" />
                    </FieldGroup>
                  </div>
                </div>

                {/* Automation */}
                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  <p className="text-xs font-extrabold text-foreground uppercase tracking-wider">Automation</p>
                  <ToggleRow label="Auto-generate on attendance approval" value={autoGenerate} onChange={setAutoGenerate} />
                  <ToggleRow label="Include QR Code on certificate" value={includeQr} onChange={setIncludeQr} />
                </div>

                {/* Cert Number Format */}
                <FieldGroup label="Certificate Number Format">
                  <input value={certNumberFormat} onChange={(e) => setCertNumberFormat(e.target.value)} className="input-field font-mono text-xs" />
                  <p className="text-[9px] text-muted-foreground mt-1">Use {"{{event_id}}"}, {"{{user_id}}"}, {"{{timestamp}}"}, {"{{year}}"}</p>
                </FieldGroup>
              </div>
            </div>
            <div className="lg:col-span-7">
              <CertificatePreview
                theme={theme}
                certTitle={certTitle}
                certSubtitle={certSubtitle}
                description={description}
                eventName={currentEvent?.title || "Event Name"}
                sigLeftName={sigLeftName}
                sigLeftTitle={sigLeftTitle}
                sigRightName={sigRightName}
                sigRightTitle={sigRightTitle}
                previewDevice={previewDevice}
                setPreviewDevice={setPreviewDevice}
                fullscreen={fullscreen}
                setFullscreen={setFullscreen}
              />
            </div>
          </>
        )}

        {/* ── Step 2: Preview ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="lg:col-span-12">
            <CertificatePreview
              theme={theme}
              certTitle={certTitle}
              certSubtitle={certSubtitle}
              description={description}
              eventName={currentEvent?.title || "Event Name"}
              sigLeftName={sigLeftName}
              sigLeftTitle={sigLeftTitle}
              sigRightName={sigRightName}
              sigRightTitle={sigRightTitle}
              previewDevice={previewDevice}
              setPreviewDevice={setPreviewDevice}
              fullscreen={fullscreen}
              setFullscreen={setFullscreen}
              large
            />
          </div>
        )}

        {/* ── Step 3: Publish & Generate ──────────────────────────── */}
        {step === 3 && (
          <>
            <div className="lg:col-span-5 space-y-5">
              {/* Summary card */}
              <div className="rounded-2xl border border-border bg-card/20 p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Design Summary</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Theme</span><span className="font-bold text-foreground">{theme.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="font-bold text-foreground">{certTitle}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Event</span><span className="font-bold text-foreground">{currentEvent?.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">QR Code</span><span className="font-bold text-foreground">{includeQr ? "Yes" : "No"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Auto-Generate</span><span className="font-bold text-foreground">{autoGenerate ? "Enabled" : "Disabled"}</span></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-card/20 p-4 text-center">
                  <p className="text-2xl font-black text-foreground">{eligible.length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Eligible</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/20 p-4 text-center">
                  <p className="text-2xl font-black text-primary">{generated.length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Generated</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/20 p-4 text-center">
                  <p className="text-2xl font-black text-foreground">{pendingUsers.length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Pending</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { handleSave("published"); }}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish Certificate Design
                </button>
                <button
                  onClick={handleGenerateAll}
                  disabled={generating || pendingUsers.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-bold text-foreground hover:bg-muted transition-all disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Generate All ({pendingUsers.length})
                </button>
                {selectedUsers.size > 0 && (
                  <button
                    onClick={() => handleBulkGenerate(Array.from(selectedUsers))}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-3 text-sm font-bold text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                    Generate Selected ({selectedUsers.size})
                  </button>
                )}
              </div>
            </div>

            {/* Participants list */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Eligible Participants</h3>
                {pendingUsers.length > 0 && (
                  <button onClick={toggleAllUsers} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">
                    {selectedUsers.size === pendingUsers.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card/10 overflow-hidden max-h-[440px] overflow-y-auto">
                {eligible.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold">No attended participants</p>
                    <p className="text-xs mt-1">Students will appear here after attendance check-in</p>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-card/30">
                        <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider w-10">#</th>
                        <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider">Student</th>
                        <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Roll No</th>
                        <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligible.map((attendee, idx) => {
                        const isGenerated = generatedUserIds.has(attendee.userId)
                        const isSelected = selectedUsers.has(attendee.userId)
                        return (
                          <tr key={attendee.userId} className="border-b border-border/50 hover:bg-card/20 transition-colors">
                            <td className="px-4 py-3">
                              {isGenerated ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleUser(attendee.userId)}
                                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                                />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-foreground">{attendee.name}</p>
                              <p className="text-muted-foreground">{attendee.email}</p>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{attendee.rollNumber || "—"}</td>
                            <td className="px-4 py-3 text-right">
                              {isGenerated ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                  <Check className="h-3 w-3" /> Generated
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Helper Components ──────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-foreground font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${value ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  )
}

// ─── Live Preview Panel ─────────────────────────────────────────────
function CertificatePreview({
  theme, certTitle, certSubtitle, description, eventName,
  sigLeftName, sigLeftTitle, sigRightName, sigRightTitle,
  previewDevice, setPreviewDevice, fullscreen, setFullscreen, large
}: {
  theme: CertificateTheme
  certTitle: string; certSubtitle: string; description: string; eventName: string
  sigLeftName: string; sigLeftTitle: string; sigRightName: string; sigRightTitle: string
  previewDevice: string; setPreviewDevice: (v: any) => void
  fullscreen: boolean; setFullscreen: (v: boolean) => void
  large?: boolean
}) {
  const c = theme.preview
  const previewWidth = previewDevice === "desktop" ? "w-full" : previewDevice === "tablet" ? "max-w-[520px]" : "max-w-[340px]"

  return (
    <div className={`rounded-2xl border border-border bg-card/10 p-4 md:p-6 space-y-4 ${fullscreen ? "fixed inset-0 z-50 bg-background overflow-auto" : ""}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Device Toggle */}
          {[
            { key: "desktop", icon: Monitor },
            { key: "tablet", icon: Tablet },
            { key: "mobile", icon: Smartphone },
          ].map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPreviewDevice(key)}
              className={`p-2 rounded-lg transition-all cursor-pointer ${previewDevice === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <button onClick={() => setFullscreen(!fullscreen)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer">
            {fullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Preview Certificate */}
      <div className="flex justify-center">
        <div className={`${previewWidth} transition-all duration-300`}>
          <div className={`aspect-[1.414] ${c.bgClass} rounded-xl border-2 ${c.borderClass} p-6 sm:p-8 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl`}>
            {/* Inner border */}
            <div className={`absolute inset-2 sm:inset-3 border ${c.borderClass} rounded-lg pointer-events-none`} />
            <div className={`absolute inset-3 sm:inset-4 border ${c.borderClass} rounded-lg pointer-events-none opacity-40`} />

            {/* Top section */}
            <div className="text-center relative z-10 space-y-1 pt-2 sm:pt-4">
              <h2 className={`text-sm sm:text-xl md:text-2xl font-serif italic ${c.titleClass} leading-tight`}>{certTitle}</h2>
              <div className={`w-16 sm:w-24 h-[1px] mx-auto ${c.borderClass}`} />
              <p className={`text-[6px] sm:text-[8px] uppercase tracking-[0.2em] ${c.accentClass}`}>{certSubtitle}</p>
            </div>

            {/* Middle section */}
            <div className="text-center relative z-10 space-y-1 sm:space-y-2 flex-1 flex flex-col justify-center">
              <p className={`text-lg sm:text-2xl md:text-3xl font-bold ${c.nameClass}`}>{"{{student_name}}"}</p>
              <div className={`w-20 sm:w-32 h-[1px] mx-auto ${c.borderClass} opacity-50`} />
              <p className={`text-[7px] sm:text-[9px] ${c.accentClass}`}>{description}</p>
              <p className={`text-xs sm:text-sm font-bold ${c.nameClass}`}>{eventName}</p>
            </div>

            {/* Bottom section */}
            <div className="w-full relative z-10 space-y-2 sm:space-y-4 pb-1 sm:pb-2">
              <div className="flex items-center justify-center gap-4 sm:gap-8 text-[6px] sm:text-[8px]">
                <span className={c.accentClass}>Date: {"{{event_date}}"}</span>
                <span className={c.accentClass}>ID: {"{{certificate_id}}"}</span>
              </div>
              <div className="flex justify-between items-end px-2 sm:px-6">
                <div className="text-center w-20 sm:w-32">
                  <p className={`text-[6px] sm:text-[8px] italic ${c.accentClass}`}>{sigLeftName}</p>
                  <p className={`text-[5px] sm:text-[6px] ${c.accentClass} opacity-60`}>{sigLeftTitle}</p>
                </div>
                {/* Center QR placeholder */}
                <div className={`h-8 w-8 sm:h-12 sm:w-12 rounded bg-white flex items-center justify-center p-0.5`}>
                  <QrCode className="h-full w-full text-black opacity-80" />
                </div>
                <div className="text-center w-20 sm:w-32">
                  <p className={`text-[6px] sm:text-[8px] italic ${c.accentClass}`}>{sigRightName}</p>
                  <p className={`text-[5px] sm:text-[6px] ${c.accentClass} opacity-60`}>{sigRightTitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info note */}
          <p className="text-center text-[9px] text-muted-foreground mt-3">
            All fields in {"{curly_braces}"} are dynamic and will be auto-filled
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Search,
  Filter,
  Calendar,
  Mail,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  X,
  Info,
  Clock,
  Sparkles,
  Check,
  ChevronRight,
  User,
  Inbox,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink
} from "lucide-react"
import { 
  updateContactStatusAction, 
  deleteContactSubmissionAction,
  getContactSubmissionsAction
} from "@/app/contact-actions"

interface Submission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  category: string
  vibe: string
  status: string
  admin_notes: string
  created_at: string
  user_id: string | null
}

interface ContactsManagerClientProps {
  initialSubmissions: Submission[]
}

export function ContactsManagerClient({ initialSubmissions }: ContactsManagerClientProps) {
  const [submissions, setSubmissions] = React.useState<Submission[]>(initialSubmissions)
  const [selectedSub, setSelectedSub] = React.useState<Submission | null>(null)
  
  // Filters state
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  
  // Edit states for detail modal
  const [editStatus, setEditStatus] = React.useState<"unread" | "read" | "resolved">("unread")
  const [adminNotes, setAdminNotes] = React.useState("")
  const [updating, setUpdating] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteConfirm, setDeleteConfirm] = React.useState(false)

  // Status messages
  const [actionStatus, setActionStatus] = React.useState<{ type: "success" | "error"; text: string } | null>(null)
  const [copied, setCopied] = React.useState(false)

  // Quick Stats
  const stats = React.useMemo(() => {
    const total = submissions.length
    const unread = submissions.filter(s => s.status === "unread").length
    const resolved = submissions.filter(s => s.status === "resolved").length
    const urgent = submissions.filter(s => s.vibe === "urgent").length
    return { total, unread, resolved, urgent }
  }, [submissions])

  // Reload submissions helper
  const refreshSubmissions = async () => {
    const res = await getContactSubmissionsAction()
    if (res.success && res.submissions) {
      setSubmissions(res.submissions)
    }
  }

  // Handle row selection
  const handleSelectSubmission = (sub: Submission) => {
    setSelectedSub(sub)
    setEditStatus(sub.status as any)
    setAdminNotes(sub.admin_notes || "")
    setDeleteConfirm(false)
    setCopied(false)
    setActionStatus(null)
  }

  const handleCopy = () => {
    if (!selectedSub) return
    navigator.clipboard.writeText(selectedSub.message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle status & note update
  const handleUpdate = async () => {
    if (!selectedSub) return
    setUpdating(true)
    setActionStatus(null)

    const res = await updateContactStatusAction(selectedSub.id, editStatus, adminNotes)
    setUpdating(false)

    if (res.success) {
      setActionStatus({ type: "success", text: "Submission updated successfully." })
      // Update local state
      setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, status: editStatus, admin_notes: adminNotes } : s))
      // Update active selection
      setSelectedSub(prev => prev ? { ...prev, status: editStatus, admin_notes: adminNotes } : null)
      refreshSubmissions()
    } else {
      setActionStatus({ type: "error", text: res.error || "Update failed." })
    }
  }

  // Handle deletion
  const handleDelete = async () => {
    if (!selectedSub) return
    setDeleting(true)
    setActionStatus(null)

    const res = await deleteContactSubmissionAction(selectedSub.id)
    setDeleting(false)

    if (res.success) {
      setSubmissions(prev => prev.filter(s => s.id !== selectedSub.id))
      setSelectedSub(null)
      setDeleteConfirm(false)
      refreshSubmissions()
    } else {
      setActionStatus({ type: "error", text: res.error || "Delete failed." })
    }
  }

  // Filter logic
  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter(sub => {
      const matchesSearch = 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.message.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || sub.status === statusFilter
      const matchesCategory = categoryFilter === "all" || sub.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [submissions, searchTerm, statusFilter, categoryFilter])

  // Category labels helper
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "collaboration": return "Collaboration"
      case "support": return "Support"
      case "feedback": return "Feedback"
      case "join": return "Join Team"
      case "general": return "General Query"
      default: return cat
    }
  }

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "collaboration": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      case "support": return "bg-blue-500/10 border-blue-500/20 text-blue-400"
      case "feedback": return "bg-violet-500/10 border-violet-500/20 text-violet-400"
      case "join": return "bg-orange-500/10 border-orange-500/20 text-orange-400"
      default: return "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
    }
  }

  const getVibeBadgeColor = (vibe: string) => {
    switch (vibe) {
      case "urgent": return "bg-rose-500/15 border-rose-500/25 text-rose-400 font-bold"
      case "standard": return "bg-primary/10 border-primary/20 text-primary"
      default: return "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Contact Submissions</h1>
        <p className="text-sm text-muted-foreground">Manage collaboration requests, student support tickets, and direct site feedbacks.</p>
      </div>

      {/* Analytics Summary Panels */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card/20 backdrop-blur-sm p-4 sm:p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Submissions</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{stats.total}</p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm">
            <Inbox className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/20 backdrop-blur-sm p-4 sm:p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] w-16 h-16 bg-rose-500/5 rounded-full blur-[20px] pointer-events-none" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unread Messages</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-400">{stats.unread}</p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-sm">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/20 backdrop-blur-sm p-4 sm:p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] w-16 h-16 bg-emerald-500/5 rounded-full blur-[20px] pointer-events-none" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resolved Tickets</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.resolved}</p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/20 backdrop-blur-sm p-4 sm:p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] w-16 h-16 bg-orange-500/5 rounded-full blur-[20px] pointer-events-none" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Urgent Queries</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-orange-400">{stats.urgent}</p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-sm">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card/10 border border-border/60 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, subject, content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 text-foreground placeholder-muted-foreground text-sm focus:border-primary focus:outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Status Select */}
          <div className="flex items-center gap-1.5 bg-background/50 border border-border rounded-xl px-3 py-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-foreground font-semibold border-0 py-1.5 focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-card text-foreground">All Statuses</option>
              <option value="unread" className="bg-card text-foreground">Unread</option>
              <option value="read" className="bg-card text-foreground">Read</option>
              <option value="resolved" className="bg-card text-foreground">Resolved</option>
            </select>
          </div>

          {/* Category Select */}
          <div className="flex items-center gap-1.5 bg-background/50 border border-border rounded-xl px-3 py-1">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-foreground font-semibold border-0 py-1.5 focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-card text-foreground">All Categories</option>
              <option value="collaboration" className="bg-card text-foreground">Collaboration</option>
              <option value="support" className="bg-card text-foreground">Support</option>
              <option value="feedback" className="bg-card text-foreground">Feedback</option>
              <option value="join" className="bg-card text-foreground">Join Team</option>
              <option value="general" className="bg-card text-foreground">General Query</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Backsheet Overlay for details drawer */}
      {selectedSub && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200" 
          onClick={() => setSelectedSub(null)}
        />
      )}

      {/* Main Content Layout (Table & Detail sidebar) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start relative">
        {/* Submissions List */}
        <div className={`transition-all duration-300 lg:col-span-8 ${selectedSub ? "lg:col-span-7" : "lg:col-span-12"}`}>
          <div className="rounded-3xl border border-border bg-card/10 backdrop-blur-sm overflow-hidden shadow-sm">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Info className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground font-semibold">No submissions found</p>
                <p className="text-xs text-muted-foreground/60">Try clearing search terms or modifying filters.</p>
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-foreground border-collapse">
                    <thead className="bg-card border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Date</th>
                        <th className="py-3.5 px-4 font-semibold">Sender</th>
                        <th className="py-3.5 px-4 font-semibold">Category</th>
                        <th className="py-3.5 px-4 font-semibold">Urgency</th>
                        <th className="py-3.5 px-4 font-semibold">Subject</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredSubmissions.map((sub) => {
                        const isSelected = selectedSub?.id === sub.id
                        const dateFormatted = new Date(sub.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })
                        
                        let statusColor = "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        if (sub.status === "read") statusColor = "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        if (sub.status === "resolved") statusColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"

                        return (
                          <tr
                            key={sub.id}
                            onClick={() => handleSelectSubmission(sub)}
                            className={`hover:bg-card/40 cursor-pointer transition-all ${
                              isSelected ? "bg-card/85 border-l-4 border-l-primary" : ""
                            }`}
                          >
                            <td className="py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {dateFormatted}
                            </td>
                            <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap max-w-[140px] truncate">
                              {sub.name}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getCategoryBadgeColor(sub.category)}`}>
                                {getCategoryLabel(sub.category)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getVibeBadgeColor(sub.vibe)}`}>
                                {sub.vibe}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-muted-foreground max-w-[200px] truncate">
                              {sub.subject}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="block sm:hidden divide-y divide-border/60">
                  {filteredSubmissions.map((sub) => {
                    const isSelected = selectedSub?.id === sub.id
                    const dateFormatted = new Date(sub.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })

                    let statusColor = "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    if (sub.status === "read") statusColor = "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    if (sub.status === "resolved") statusColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"

                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleSelectSubmission(sub)}
                        className={`p-4 hover:bg-card/40 cursor-pointer space-y-2.5 transition-all ${
                          isSelected ? "bg-card/85 border-l-4 border-l-primary" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground">{sub.name}</p>
                          <span className="text-[10px] text-muted-foreground">{dateFormatted}</span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-foreground truncate">{sub.subject}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{sub.message}</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 items-center justify-between pt-1 border-t border-border/30">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold ${getCategoryBadgeColor(sub.category)}`}>
                              {getCategoryLabel(sub.category)}
                            </span>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getVibeBadgeColor(sub.vibe)}`}>
                              {sub.vibe}
                            </span>
                          </div>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selected Submission Drawer Panel - Inquiry Command Center */}
        <AnimatePresence>
          {selectedSub && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.98 }}
              className="fixed md:sticky bottom-0 md:top-6 left-0 right-0 md:left-auto md:right-auto z-50 md:z-auto bg-card md:bg-card/25 border-t md:border border-border/80 backdrop-blur-2xl p-5 md:p-6 rounded-t-[2.5rem] md:rounded-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.3)] md:shadow-2xl max-h-[85vh] md:max-h-none overflow-y-auto md:col-span-4 lg:col-span-5 space-y-5 animate-in slide-in-from-bottom duration-300 md:animate-none md:translate-x-0"
            >
              {/* Mobile handle indicator */}
              <div className="h-1 w-12 bg-muted rounded-full mx-auto md:hidden mb-2" onClick={() => setSelectedSub(null)} />

              {/* Header profile info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Dynamic Avatar */}
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0 shadow-md">
                    <img
                      src={`https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${encodeURIComponent(selectedSub.email)}`}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-sm font-extrabold text-foreground truncate flex items-center gap-1.5">
                      {selectedSub.name}
                    </h3>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-tight uppercase ${
                      selectedSub.user_id ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                    }`}>
                      {selectedSub.user_id ? "Registered Student" : "Guest / Anonymous"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSub(null)}
                  className="p-1.5 hover:bg-muted border border-border/50 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Action buttons row */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={`mailto:${selectedSub.email}?subject=Re: [Crew Sync Support] ${encodeURIComponent(selectedSub.subject)}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-border bg-card/60 rounded-xl hover:bg-muted font-bold text-foreground transition-all shadow-sm"
                >
                  <Mail className="h-3.5 w-3.5 text-primary" /> Email Sender
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-border bg-card/60 rounded-xl hover:bg-muted font-bold text-foreground transition-all shadow-sm cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400 animate-scale" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Copy Message
                    </>
                  )}
                </button>
              </div>

              {/* Meta details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-background/30 p-3 rounded-2xl border border-border/40">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Category</p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getCategoryBadgeColor(selectedSub.category)}`}>
                    {getCategoryLabel(selectedSub.category)}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Submitted</p>
                  <p className="font-semibold text-foreground flex items-center gap-1 truncate">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {new Date(selectedSub.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>

              {/* Urgency Gauge concept */}
              <div className="space-y-2 bg-background/30 p-3 rounded-2xl border border-border/40">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Urgency Gauge</p>
                <div className="space-y-1">
                  {/* Gauge Bar */}
                  <div className="h-2 w-full bg-muted rounded-full relative overflow-hidden flex">
                    <div className={`h-full flex-1 transition-all ${selectedSub.vibe === "browsing" ? "bg-emerald-500" : "bg-muted"}`} />
                    <div className={`h-full flex-1 transition-all ${selectedSub.vibe === "standard" ? "bg-primary" : "bg-muted"}`} />
                    <div className={`h-full flex-1 transition-all ${selectedSub.vibe === "urgent" ? "bg-rose-500" : "bg-muted"}`} />
                  </div>
                  {/* Gauge Label */}
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                    <span className={selectedSub.vibe === "browsing" ? "text-emerald-400 font-bold" : ""}>☕ Browsing</span>
                    <span className={selectedSub.vibe === "standard" ? "text-primary font-bold" : ""}>⚡ Standard</span>
                    <span className={selectedSub.vibe === "urgent" ? "text-rose-400 font-bold animate-pulse" : ""}>🚨 Urgent</span>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-1.5 bg-background/30 p-3 rounded-2xl border border-border/40">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Subject & Content</p>
                <p className="text-xs font-bold text-foreground leading-snug">{selectedSub.subject}</p>
                <div className="rounded-xl border border-border/60 bg-background/50 p-3 max-h-[140px] overflow-y-auto text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedSub.message}
                </div>
              </div>

              {/* Inquiry Lifecycle Audit Trail */}
              <div className="space-y-2.5 bg-background/30 p-3 rounded-2xl border border-border/40">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Pipeline Lifecycle</p>
                
                <div className="relative pl-6 space-y-4 text-xs">
                  {/* Connecting Line */}
                  <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-border/60" />
                  
                  {/* Step 1: Received */}
                  <div className="relative">
                    <div className="absolute -left-5.5 h-3.5 w-3.5 rounded-full bg-emerald-500/25 border border-emerald-500 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Inquiry Logged</p>
                      <p className="text-[10px] text-muted-foreground">Inquiry received and queued in Supabase pipelines</p>
                    </div>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="relative">
                    <div className={`absolute -left-5.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ${
                      selectedSub.status !== "unread" 
                        ? "bg-blue-500/25 border border-blue-500" 
                        : "bg-background border border-border"
                    }`}>
                      {selectedSub.status !== "unread" && <Check className="h-2.5 w-2.5 text-blue-400" />}
                    </div>
                    <div>
                      <p className={`font-bold ${selectedSub.status !== "unread" ? "text-foreground" : "text-muted-foreground"}`}>Opened & Reviewed</p>
                      <p className="text-[10px] text-muted-foreground">Admin reviewed details and drafted resolution path</p>
                    </div>
                  </div>

                  {/* Step 3: Resolved */}
                  <div className="relative">
                    <div className={`absolute -left-5.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ${
                      selectedSub.status === "resolved" 
                        ? "bg-emerald-500/25 border border-emerald-500" 
                        : "bg-background border border-border"
                    }`}>
                      {selectedSub.status === "resolved" && <Check className="h-2.5 w-2.5 text-emerald-400" />}
                    </div>
                    <div>
                      <p className={`font-bold ${selectedSub.status === "resolved" ? "text-foreground" : "text-muted-foreground"}`}>Resolved</p>
                      <p className="text-[10px] text-muted-foreground">Action items completed, database updated</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Inputs Command Area */}
              <div className="bg-background/40 p-4 rounded-2xl border border-border/80 space-y-4">
                {/* Status Toggle Pills */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Update Pipeline Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["unread", "read", "resolved"] as const).map((status) => {
                      const isActive = editStatus === status
                      let color = "border-rose-500/30 text-rose-400 bg-rose-500/10"
                      if (status === "read") color = "border-blue-500/30 text-blue-400 bg-blue-500/10"
                      if (status === "resolved") color = "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setEditStatus(status)}
                          className={`py-1.5 px-2 text-[10px] font-bold rounded-xl border transition-all text-center uppercase tracking-wider cursor-pointer ${
                            isActive ? `${color} scale-[1.02] ring-1 ring-border shadow-sm` : "border-border/60 bg-background/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notes Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Internal Admin Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add administrative review details, response summaries, action items..."
                    className="block w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                {/* Save button and status */}
                {actionStatus && (
                  <div className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 ${
                    actionStatus.type === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span>{actionStatus.text}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground py-2.5 text-xs font-bold shadow-lg shadow-primary/10 hover:bg-primary/95 cursor-pointer disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" /> Save Changes
                      </>
                    )}
                  </button>

                  {/* Delete actions */}
                  {deleteConfirm ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(false)}
                        className="px-2 py-1.5 rounded-xl border border-border bg-card text-muted-foreground text-xs font-bold cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(true)}
                      className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 cursor-pointer shadow-sm"
                      aria-label="Delete Submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

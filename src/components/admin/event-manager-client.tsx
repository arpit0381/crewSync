"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { createEventAction, updateEventStatusAction, deleteEventAction, updateEventAction } from "@/app/event-actions"
import { requestEventFeedbackAction } from "@/app/notification-actions"
import { getFeedbackStatsAction } from "@/app/feedback-actions"
import { Calendar, MapPin, Users, Plus, X, Loader2, Check, ArrowRight, ClipboardCheck, Trash2, Search, LayoutGrid, List, Filter, Edit2, Copy, Archive, Share2, QrCode, Ticket, Star, MessageSquare } from "lucide-react"

interface Category {
  id: string
  name: string
  type: string
}

interface Department {
  id: string
  name: string
  code: string
}

interface Club {
  id: string
  name: string
}

interface Event {
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
  status: "draft" | "pending_approval" | "published" | "completed"
  category_id: string
  categories?: { name: string; type: string }
  department_id?: string | null
  club_id?: string | null
  registrationsCount?: number
  is_paid?: boolean
  fee_amount?: number
  payment_qr_url?: string | null
  payment_remarks?: string | null
}

interface EventManagerClientProps {
  initialEvents: Event[]
  categories: Category[]
  departments: Department[]
  clubs: Club[]
}

export function EventManagerClient({
  initialEvents,
  categories,
  departments,
  clubs,
}: EventManagerClientProps) {
  const [events, setEvents] = React.useState<Event[]>(initialEvents)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [activeFilter, setActiveFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  
  const [modalMode, setModalMode] = React.useState<"create" | "edit" | "clone">("create")
  const [activeEvent, setActiveEvent] = React.useState<Event | null>(null)
  const [eventToDelete, setEventToDelete] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [qrEvent, setQrEvent] = React.useState<Event | null>(null)
  
  const [regType, setRegType] = React.useState<"individual" | "team">("individual")
  const [isPaid, setIsPaid] = React.useState(false)

  // Feedback states
  const [feedbackStatsEvent, setFeedbackStatsEvent] = React.useState<{ id: string; title: string } | null>(null)
  const [feedbackStats, setFeedbackStats] = React.useState<any>(null)
  const [loadingFeedbackStats, setLoadingFeedbackStats] = React.useState(false)
  const [feedbackStatsError, setFeedbackStatsError] = React.useState<string | null>(null)
  const [requestFeedbackEventId, setRequestFeedbackEventId] = React.useState<string | null>(null)
  const [requestingFeedback, setRequestingFeedback] = React.useState(false)

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      const matchesFilter = activeFilter === "all" || e.status === activeFilter
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.venue.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [events, activeFilter, searchQuery])

  // Analytics
  const totalEvents = events.length
  const publishedEvents = events.filter(e => e.status === "published").length
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date()).length

  const handleCopyLink = async (eventId: string) => {
    try {
      const url = `${window.location.origin}/events/${eventId}`
      await navigator.clipboard.writeText(url)
      setSuccess("Event link copied to clipboard!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to copy link")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return
    setIsDeleting(true)
    const result = await deleteEventAction(eventToDelete)
    if (result.success) {
      setEvents(events.filter(e => e.id !== eventToDelete))
    } else {
      setError(result.error || "Failed to delete event")
    }
    setIsDeleting(false)
    setEventToDelete(null)
  }

  const handleOpenModal = (mode: "create" | "edit" | "clone", event?: Event) => {
    setModalMode(mode)
    if (event) {
      setActiveEvent(event)
      setRegType(event.reg_type)
      setIsPaid(event.is_paid || false)
    } else {
      setActiveEvent(null)
      setRegType("individual")
      setIsPaid(false)
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    
    // Fix Turbopack binary stream bug by uploading via a standard API route instead of Server Action
    const bannerFile = formData.get("banner_file") as File
    if (bannerFile && bannerFile.size > 0) {
      // Compress the image before uploading to avoid 10MB JSON string truncation limits
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new window.Image()
          img.onload = () => {
            const canvas = document.createElement("canvas")
            const MAX_WIDTH = 1920
            const MAX_HEIGHT = 1080
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
            resolve(canvas.toDataURL("image/jpeg", 0.7)) // compress to 70% quality JPEG
          }
          img.onerror = reject
          img.src = e.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(bannerFile)
      })
      
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, folder: "banners" })
        })
        const uploadData = await uploadRes.json()
        if (uploadData.url) {
          formData.set("banner_url_override", uploadData.url)
        } else if (uploadData.error) {
          setError("Upload failed: " + uploadData.error)
          setLoading(false)
          return
        }
      } catch (err: any) {
        setError("Upload failed: " + err.message)
        setLoading(false)
        return
      }
    }
    // Remove the file blob and base64 entirely from formData so Turbopack doesn't see it
    formData.delete("banner_file")
    formData.delete("banner_base64")

    // QR Image Upload logic
    const paymentQrFile = formData.get("payment_qr_file") as File
    if (paymentQrFile && paymentQrFile.size > 0) {
      const qrBase64 = await new Promise<string>((resolve, reject) => {
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
        reader.readAsDataURL(paymentQrFile)
      })
      
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: qrBase64, folder: "qrs" })
        })
        const uploadData = await uploadRes.json()
        if (uploadData.url) {
          formData.set("payment_qr_url_override", uploadData.url)
        } else if (uploadData.error) {
          setError("QR Upload failed: " + uploadData.error)
          setLoading(false)
          return
        }
      } catch (err: any) {
        setError("QR Upload failed: " + err.message)
        setLoading(false)
        return
      }
    }
    formData.delete("payment_qr_file")

    let result
    if (modalMode === "edit" && activeEvent) {
      result = await updateEventAction(activeEvent.id, formData)
    } else {
      result = await createEventAction(formData)
    }

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success && result.event) {
      setSuccess(result.success)
      
      // Inject details locally to avoid page reload delays
      const processedEvent: Event = {
        id: result.event.id,
        title: result.event.title,
        description: result.event.description,
        banner_url: result.event.banner_url,
        venue: result.event.venue,
        event_date: result.event.event_date,
        event_time: result.event.event_time,
        capacity: result.event.capacity,
        reg_type: result.event.reg_type,
        min_team_size: result.event.min_team_size,
        max_team_size: result.event.max_team_size,
        status: result.event.status,
        category_id: result.event.category_id,
        department_id: result.event.department_id,
        club_id: result.event.club_id,
        is_paid: result.event.is_paid,
        fee_amount: result.event.fee_amount,
        payment_qr_url: result.event.payment_qr_url,
        payment_remarks: result.event.payment_remarks,
        categories: categories.find((c) => c.id === result.event.category_id),
        registrationsCount: modalMode === "edit" ? activeEvent?.registrationsCount : 0
      }

      if (modalMode === "edit") {
        setEvents(events.map(e => e.id === processedEvent.id ? processedEvent : e))
      } else {
        setEvents([processedEvent, ...events])
      }
      
      setLoading(false)
      setIsModalOpen(false)
      // Reset form
      const form = e.target as HTMLFormElement
      form.reset()
    }
  }

  const handleStatusChange = async (eventId: string, status: any) => {
    const result = await updateEventStatusAction(eventId, status)
    if (result.success) {
      setEvents(
        events.map((e) => (e.id === eventId ? { ...e, status } : e))
      )
    }
  }

  const handleRequestFeedback = async (eventId: string) => {
    setRequestingFeedback(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await requestEventFeedbackAction(eventId)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully sent feedback requests to ${result.count} participants.`)
        setTimeout(() => setSuccess(null), 4000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to send feedback requests.")
    } finally {
      setRequestingFeedback(false)
      setRequestFeedbackEventId(null)
    }
  }

  const handleOpenFeedbackStats = async (eventId: string, eventTitle: string) => {
    setFeedbackStatsEvent({ id: eventId, title: eventTitle })
    setLoadingFeedbackStats(true)
    setFeedbackStatsError(null)
    setFeedbackStats(null)
    try {
      const result = await getFeedbackStatsAction(eventId)
      if (result.error) {
        setFeedbackStatsError(result.error)
      } else {
        setFeedbackStats(result.stats)
      }
    } catch (err: any) {
      setFeedbackStatsError(err.message || "Failed to load feedback details.")
    } finally {
      setLoadingFeedbackStats(false)
    }
  }

  const handleCopyFeedbackLink = (eventId: string) => {
    if (typeof window !== "undefined") {
      const link = `${window.location.origin}/student/notifications?feedback=${eventId}`
      navigator.clipboard.writeText(link)
      setSuccess("Feedback link copied to clipboard!")
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Global Notifications */}
      {(success || error) && !isModalOpen && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top-4 duration-300 ${success ? 'bg-emerald-950/90 border-emerald-900 text-emerald-400' : 'bg-red-950/90 border-red-900 text-red-400'}`}>
          <p className="text-sm font-semibold flex items-center gap-2">
            {success ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {success || error}
          </p>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Manage Events</h1>
          <p className="text-sm text-muted-foreground">Configure registrations, parameters, and statuses.</p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Total Events</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalEvents}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-foreground mt-1">{publishedEvents}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold text-foreground mt-1">{upcomingEvents}</p>
        </div>
      </div>

      {/* Toolbar: Search, Filter Tabs, View Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events by title or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto">
          {["all", "draft", "pending_approval", "published", "completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-3 min-h-[44px] text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                activeFilter === filter
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Grid / List */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No events found for this filter.
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className="flex flex-col rounded-3xl border border-border bg-card/85 overflow-hidden group relative"
            >
              {/* Event Image Banner (Admin View) */}
              <div className="h-32 w-full relative overflow-hidden bg-gradient-to-br from-zinc-850 to-zinc-950 flex items-center justify-center">
                {event.banner_url ? (
                  <Image
                    src={event.banner_url}
                    alt={event.title}
                    fill
                    priority={index < 3}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Quick Actions (Always visible on mobile, hover on desktop) */}
                <div className="absolute top-3 right-3 flex items-center gap-2 flex-wrap justify-end max-w-[80%] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleOpenModal("edit", event)} className="p-1.5 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50 shadow-sm" title="Edit Event">
                     <Edit2 className="h-3.5 w-3.5" />
                   </button>
                   <button onClick={() => handleOpenModal("clone", event)} className="p-1.5 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50 shadow-sm" title="Clone Event">
                     <Copy className="h-3.5 w-3.5" />
                   </button>
                   <button onClick={() => handleCopyLink(event.id)} className="p-1.5 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50 shadow-sm" title="Copy Link">
                     <Share2 className="h-3.5 w-3.5" />
                   </button>
                   <button onClick={() => setQrEvent(event)} className="p-1.5 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50 shadow-sm" title="Show QR Code">
                     <QrCode className="h-3.5 w-3.5" />
                   </button>
                   <button onClick={() => handleOpenFeedbackStats(event.id, event.title)} className="p-1.5 rounded-full bg-background text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors border border-border/50 shadow-sm" title="View Feedback Ratings">
                     <Star className="h-3.5 w-3.5 fill-yellow-500/20" />
                   </button>
                   {event.status === "completed" && (
                     <>
                       <button onClick={() => setRequestFeedbackEventId(event.id)} className="p-1.5 rounded-full bg-background text-blue-500 hover:bg-blue-500 hover:text-white transition-colors border border-border/50 shadow-sm" title="Request Feedback Broadcast">
                         <MessageSquare className="h-3.5 w-3.5" />
                       </button>
                       <button onClick={() => handleCopyFeedbackLink(event.id)} className="p-1.5 rounded-full bg-background text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors border border-border/50 shadow-sm" title="Copy Direct Feedback Link">
                         <Share2 className="h-3.5 w-3.5" />
                       </button>
                     </>
                   )}
                   <button onClick={() => setEventToDelete(event.id)} className="p-1.5 rounded-full bg-background text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-border/50 shadow-sm" title="Delete Event">
                     <Trash2 className="h-3.5 w-3.5" />
                   </button>
                </div>
              </div>
              <div className="p-6 space-y-4 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                    {event.categories?.name || "Event"}
                  </span>
                  
                  {/* Status Badges with Switch capability */}
                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(event.id, e.target.value as any)}
                    className="bg-background text-xs font-semibold border border-border rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground leading-tight">{event.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{event.description}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-border/80 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{event.event_date} at {event.event_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {event.reg_type === "team" 
                        ? `Teams (Size: ${event.min_team_size}-${event.max_team_size})` 
                        : "Individual Registrations"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {event.is_paid ? `Paid (₹${event.fee_amount})` : "Free"}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all" 
                        style={{ width: `${Math.min(100, ((event.registrationsCount || 0) / event.capacity) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-wider">
                      <span>{event.registrationsCount || 0} Registered</span>
                      <span>{event.capacity} Capacity</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/80 flex items-center gap-2">
                  <Link 
                    href={`/admin/events/${event.id}/attendance`} 
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary py-2.5 text-sm font-semibold hover:bg-primary/20 transition-all"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Attendance
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Event</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Date & Venue</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Registrations</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.categories?.name || "Event"} • {event.reg_type} • {event.is_paid ? `₹${event.fee_amount}` : "Free"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{event.event_date} {event.event_time}</div>
                    <div className="text-xs text-muted-foreground">{event.venue}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={event.status}
                      onChange={(e) => handleStatusChange(event.id, e.target.value as any)}
                      className="bg-transparent text-xs font-semibold border border-border rounded px-2 py-1 focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="published">Published</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all" 
                          style={{ width: `${Math.min(100, ((event.registrationsCount || 0) / event.capacity) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{event.registrationsCount || 0}/{event.capacity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/events/${event.id}/attendance`} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Attendance">
                        <ClipboardCheck className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleOpenModal("edit", event)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleOpenModal("clone", event)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Clone">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleCopyLink(event.id)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Copy Link">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setQrEvent(event)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="QR Code">
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleOpenFeedbackStats(event.id, event.title)} className="p-1.5 text-muted-foreground hover:text-yellow-500 transition-colors" title="View Feedback">
                        <Star className="h-4 w-4 fill-yellow-500/20" />
                      </button>
                      {event.status === "completed" && (
                        <>
                          <button onClick={() => setRequestFeedbackEventId(event.id)} className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors" title="Request Feedback">
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleCopyFeedbackLink(event.id)} className="p-1.5 text-muted-foreground hover:text-emerald-500 transition-colors" title="Copy Feedback Link">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => setEventToDelete(event.id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-foreground mb-6">
              {modalMode === "edit" ? "Edit Event" : modalMode === "clone" ? "Clone Event" : "Create New Event"}
            </h2>

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={activeEvent?.title || ""}
                  className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  placeholder="E.g. Code Gladiators 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={activeEvent?.description || ""}
                  className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  placeholder="Explain event details, guidelines, rules..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Event Banner Image {modalMode === "edit" && activeEvent?.banner_url && "(Leave empty to keep current)"}
                </label>
                <input
                  name="banner_file"
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none text-xs transition-all"
                />
              </div>

              <div className="border-t border-border/80 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-foreground">Paid Event</label>
                    <p className="text-xs text-muted-foreground">Does this event require a registration fee?</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="is_paid" 
                      className="sr-only peer"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {isPaid && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200 bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fee Amount (₹)</label>
                      <input
                        name="fee_amount"
                        type="number"
                        inputMode="numeric"
                        defaultValue={activeEvent?.fee_amount || 0}
                        required={isPaid}
                        className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                        placeholder="e.g., 250"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        UPI QR Code Image {modalMode === "edit" && activeEvent?.payment_qr_url && "(Leave empty to keep)"}
                      </label>
                      <input
                        name="payment_qr_file"
                        type="file"
                        accept="image/*"
                        required={isPaid && !activeEvent?.payment_qr_url}
                        className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none text-xs transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Instructions / UPI ID</label>
                      <input
                        name="payment_remarks"
                        type="text"
                        defaultValue={activeEvent?.payment_remarks || ""}
                        className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                        placeholder="e.g., Pay to crewarena@ybl or Any other remarks"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                  <select
                    name="category_id"
                    required
                    defaultValue={activeEvent?.category_id || ""}
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Venue</label>
                  <input
                    name="venue"
                    type="text"
                    required
                    defaultValue={activeEvent?.venue || ""}
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-sm transition-all"
                    placeholder="E.g. Seminar Hall 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                  <input
                    name="event_date"
                    type="date"
                    required
                    defaultValue={activeEvent?.event_date || ""}
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</label>
                  <input
                    name="event_time"
                    type="time"
                    required
                    defaultValue={activeEvent?.event_time ? activeEvent.event_time.slice(0, 5) : ""}
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacity Limit</label>
                  <input
                    name="capacity"
                    type="number"
                    inputMode="numeric"
                    defaultValue={activeEvent?.capacity || 100}
                    required
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/80 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department (Optional)</label>
                  <select
                    name="department_id"
                    defaultValue={activeEvent?.department_id || ""}
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  >
                    <option value="">None (Platform-wide)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Club Hosting (Optional)</label>
                  <select
                    name="club_id"
                    defaultValue={activeEvent?.club_id || ""}
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  >
                    <option value="">None (Departmental)</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-border/80 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-foreground">Registration Type</label>
                    <p className="text-xs text-muted-foreground">Decide if students register as individuals or teams.</p>
                  </div>
                  <div className="flex rounded-xl border border-border bg-background p-1">
                    <button
                      type="button"
                      onClick={() => setRegType("individual")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        regType === "individual" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                      }`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegType("team")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        regType === "team" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                      }`}
                    >
                      Team
                    </button>
                    <input type="hidden" name="reg_type" value={regType} />
                  </div>
                </div>

                {regType === "team" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Team Size</label>
                      <input
                        name="min_team_size"
                        type="number"
                        inputMode="numeric"
                        defaultValue={activeEvent?.min_team_size || 2}
                        required
                        className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Team Size</label>
                      <input
                        name="max_team_size"
                        type="number"
                        inputMode="numeric"
                        defaultValue={activeEvent?.max_team_size || 4}
                        required
                        className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Draft / Publish</label>
                <select
                  name="status"
                  defaultValue={activeEvent?.status || "published"}
                  className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                >
                  <option value="draft">Save as Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="published">Publish Immediately</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalMode === "edit" ? "Save Changes" : modalMode === "clone" ? "Clone Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-red-500 mb-4">
              <div className="p-3 rounded-full bg-red-500/10">
                <Trash2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Delete Event</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to delete this event? This action cannot be undone. All registrations and associated data will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <button
              onClick={() => setQrEvent(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-3 rounded-full bg-primary/10 mb-4 text-primary">
              <QrCode className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Event QR Code</h2>
            <p className="text-sm text-muted-foreground mb-6">Scan to view or register for {qrEvent.title}</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-zinc-200 mb-6">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/events/${qrEvent.id}` : '')}`} 
                 alt="QR Code"
                 loading="lazy"
                 className="w-48 h-48"
               />
            </div>
            
            <button
              onClick={() => handleCopyLink(qrEvent.id)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all"
            >
              <Share2 className="h-4 w-4" />
              Copy Direct Link
            </button>
          </div>
        </div>
      )}

      {/* Request Feedback Confirmation Modal */}
      {requestFeedbackEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center select-none">
            <button
              onClick={() => setRequestFeedbackEventId(null)}
              disabled={requestingFeedback}
              className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 text-blue-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Request Feedback</h2>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              This will send a feedback request notification to all students registered for this event. Are you sure you want to broadcast?
            </p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setRequestFeedbackEventId(null)}
                disabled={requestingFeedback}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestFeedback(requestFeedbackEventId)}
                disabled={requestingFeedback}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {requestingFeedback ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Broadcast"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Analytics Modal */}
      {feedbackStatsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] select-none">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4 mb-4 pr-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500" /> Event Reviews
                </span>
                <h2 className="text-xl font-bold text-foreground mt-2 leading-tight">Feedback Analytics</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{feedbackStatsEvent.title}</p>
              </div>
              <button
                onClick={() => setFeedbackStatsEvent(null)}
                className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {loadingFeedbackStats ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-semibold">Fetching feedback analytics...</p>
                </div>
              ) : feedbackStatsError ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                  {feedbackStatsError}
                </div>
              ) : feedbackStats && feedbackStats.count === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center space-y-4">
                  <Star className="h-12 w-12 text-zinc-700 stroke-[1.5]" />
                  <div>
                    <p className="font-semibold text-foreground">No feedback submitted yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Send a broadcast notification requesting feedback once the event completes.</p>
                  </div>
                </div>
              ) : feedbackStats ? (
                <>
                  {/* Top Stats Overview */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Rating</span>
                      <span className="text-4xl font-extrabold text-foreground mt-1 flex items-center gap-1">
                        {feedbackStats.averageRating}
                        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_4px_rgba(250,204,21,0.3)]" />
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1 font-semibold">Out of 5.0 Stars</span>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Submissions</span>
                      <span className="text-4xl font-extrabold text-foreground mt-1">
                        {feedbackStats.count}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1 font-semibold">Reviews collected</span>
                    </div>

                    {/* Simple Bar Distribution */}
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-col justify-center sm:col-span-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">Distribution</span>
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map((r) => {
                          const count = feedbackStats.distribution[r] || 0
                          const percentage = feedbackStats.count > 0 ? (count / feedbackStats.count) * 100 : 0
                          return (
                            <div key={r} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                              <span className="w-2">{r}★</span>
                              <div className="flex-1 h-2 bg-background border border-border/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-400" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-4 text-right">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Individual Comments */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-foreground">Participant Comments ({feedbackStats.count})</h3>
                    <div className="space-y-3">
                      {feedbackStats.feedbacks.map((f: any) => (
                        <div key={f.id} className="rounded-2xl border border-border bg-card/40 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-foreground">{f.studentName}</span>
                              <span className="text-[10px] text-muted-foreground ml-2">({f.studentRoll} • {f.studentDept})</span>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < f.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"}`} 
                                />
                              ))}
                            </div>
                          </div>
                          {f.text ? (
                            <p className="text-xs text-muted-foreground leading-relaxed italic">"{f.text}"</p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/40 italic font-mono">No comment left.</p>
                          )}
                          <div className="text-[9px] text-muted-foreground/60 text-right">
                            {new Date(f.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 mt-4 flex justify-end">
              <button
                onClick={() => setFeedbackStatsEvent(null)}
                className="rounded-xl border border-border bg-background px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

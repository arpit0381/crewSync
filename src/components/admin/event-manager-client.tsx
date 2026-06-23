"use client"

import * as React from "react"
import Image from "next/image"
import { createEventAction, updateEventStatusAction } from "@/app/event-actions"
import { Calendar, MapPin, Users, Plus, X, Loader2, Check, ArrowRight } from "lucide-react"

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
  
  // Registration type state for conditional fields
  const [regType, setRegType] = React.useState<"individual" | "team">("individual")

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (activeFilter === "all") return true
      return e.status === activeFilter
    })
  }, [events, activeFilter])

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

    const result = await createEventAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success && result.event) {
      setSuccess(result.success)
      
      // Inject details locally to avoid page reload delays
      const newEvent: Event = {
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
        categories: categories.find((c) => c.id === result.event.category_id)
      }

      setEvents([newEvent, ...events])
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

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Manage Events</h1>
          <p className="text-sm text-muted-foreground">Configure registrations, parameters, and statuses.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Filter Tabs */}
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

      {/* Events List Grid */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No events found for this filter.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col rounded-3xl border border-border bg-card/20 backdrop-blur-sm overflow-hidden group"
            >
              {/* Event Image Banner (Admin View) */}
              <div className="h-32 w-full relative overflow-hidden bg-gradient-to-br from-zinc-850 to-zinc-950 flex items-center justify-center">
                {event.banner_url ? (
                  <Image
                    src={event.banner_url}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-background/40" />
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
                </div>
              </div>
            </div>
          ))}
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

            <h2 className="text-xl font-bold text-foreground mb-6">Create New Event</h2>

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
                  className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  placeholder="Explain event details, guidelines, rules..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Banner Image</label>
                <input
                  name="banner_file"
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none text-xs transition-all"
                />
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                  <select
                    name="category_id"
                    required
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
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</label>
                  <input
                    name="event_time"
                    type="time"
                    required
                    className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacity Limit</label>
                  <input
                    name="capacity"
                    type="number"
                    inputMode="numeric"
                    defaultValue={100}
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
                        defaultValue={2}
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
                        defaultValue={4}
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
                  defaultValue="published"
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
                  Submit Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

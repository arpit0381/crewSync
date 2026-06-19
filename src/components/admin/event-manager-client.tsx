"use client"

import * as React from "react"
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

  const filteredEvents = events.filter((e) => {
    if (activeFilter === "all") return true
    return e.status === activeFilter
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
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
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Manage Events</h1>
          <p className="text-sm text-zinc-400">Configure registrations, parameters, and statuses.</p>
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
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-px overflow-x-auto">
        {["all", "draft", "pending_approval", "published", "completed"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeFilter === filter
                ? "border-primary text-primary"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {filter.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Events List Grid */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
          No events found for this filter.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-hidden group"
            >
              {/* Event Image Banner (Admin View) */}
              <div className="h-32 w-full relative overflow-hidden bg-gradient-to-br from-zinc-850 to-zinc-950 flex items-center justify-center">
                {event.banner_url ? (
                  <img 
                    src={event.banner_url} 
                    alt={event.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-zinc-950/40" />
              </div>
              <div className="p-6 space-y-4 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                    {event.categories?.name || "Event"}
                  </span>
                  
                  {/* Status Badges with Switch capability */}
                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(event.id, e.target.value as any)}
                    className="bg-zinc-950 text-xs font-semibold border border-zinc-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary text-zinc-300"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{event.description}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-800/80 space-y-2 text-xs text-zinc-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-zinc-800 text-zinc-400"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Create New Event</h2>

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Event Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none text-sm transition-all"
                  placeholder="E.g. Code Gladiators 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none text-sm transition-all"
                  placeholder="Explain event details, guidelines, rules..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Event Banner Image</label>
                <input
                  name="banner_file"
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white focus:border-primary focus:outline-none text-xs transition-all"
                />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                  <select
                    name="category_id"
                    required
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Venue</label>
                  <input
                    name="venue"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none text-sm transition-all"
                    placeholder="E.g. Seminar Hall 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
                  <input
                    name="event_date"
                    type="date"
                    required
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Time</label>
                  <input
                    name="event_time"
                    type="time"
                    required
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Capacity Limit</label>
                  <input
                    name="capacity"
                    type="number"
                    defaultValue={100}
                    required
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Department (Optional)</label>
                  <select
                    name="department_id"
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                  >
                    <option value="">None (Platform-wide)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Club Hosting (Optional)</label>
                  <select
                    name="club_id"
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                  >
                    <option value="">None (Departmental)</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-zinc-800/80 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-white">Registration Type</label>
                    <p className="text-xs text-zinc-500">Decide if students register as individuals or teams.</p>
                  </div>
                  <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                    <button
                      type="button"
                      onClick={() => setRegType("individual")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        regType === "individual" ? "bg-primary text-primary-foreground shadow" : "text-zinc-500"
                      }`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegType("team")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        regType === "team" ? "bg-primary text-primary-foreground shadow" : "text-zinc-500"
                      }`}
                    >
                      Team
                    </button>
                    <input type="hidden" name="reg_type" value={regType} />
                  </div>
                </div>

                {regType === "team" && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Min Team Size</label>
                      <input
                        name="min_team_size"
                        type="number"
                        defaultValue={2}
                        required
                        className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Max Team Size</label>
                      <input
                        name="max_team_size"
                        type="number"
                        defaultValue={4}
                        required
                        className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status Draft / Publish</label>
                <select
                  name="status"
                  defaultValue="published"
                  className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
                >
                  <option value="draft">Save as Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="published">Publish Immediately</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-850 transition-all"
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

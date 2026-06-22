"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, X, Loader2, Award, ClipboardCheck } from "lucide-react"

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
  status: string
  categories?: { name: string; type: string }
}

interface EventBrowserClientProps {
  events: Event[]
  userRegistrations?: string[]
}

export function EventBrowserClient({ events, userRegistrations = [] }: EventBrowserClientProps) {
  const handleClose = () => {
    setSelectedEvent(null)
    setError(null)
    setSuccess(null)
    setInviteCodeResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Upcoming Campus Events</h1>
        <p className="text-sm text-muted-foreground">Discover and register for workshops, sports, esports, and hackathons.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-col rounded-3xl border border-border bg-card/20 backdrop-blur-sm overflow-hidden hover:border-border transition-all group"
          >
            {/* Event Image Banner (Student View) */}
            <div className="h-40 w-full relative overflow-hidden bg-gradient-to-br from-zinc-850 to-zinc-950 flex items-center justify-center">
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
            <div className="p-6 flex flex-col flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {event.categories?.name || "Campus Event"}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  {event.reg_type}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {event.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{event.event_date} at {event.event_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
              </div>

              {userRegistrations.includes(event.id) ? (
                <div className="flex gap-2 w-full mt-2">
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center rounded-xl bg-primary/20 border border-primary/50 text-primary py-2.5 text-sm font-bold opacity-80 cursor-not-allowed"
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" /> Registered
                  </button>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex-1 flex items-center justify-center rounded-xl bg-card border border-border text-foreground hover:bg-muted py-2.5 text-sm font-semibold transition-all"
                  >
                    Details
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/events/${event.id}`}
                  className="w-full mt-2 flex items-center justify-center rounded-xl bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary py-2.5 text-sm font-semibold transition-all"
                >
                  View Details & Register
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

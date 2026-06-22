"use client"

import React, { useState } from "react"
import { Ticket, Users, Calendar, Download, Search, Loader2 } from "lucide-react"
import { getRegistrationsByEventAction } from "./actions"

interface EventBasic {
  id: string
  title: string
}

interface RegistrationFull {
  id: string
  created_at: string
  event_title: string
  reg_type: string
  student_name: string
  roll_number: string
  phone: string
  email: string
  team_name: string | null
}

interface RegistrationsClientProps {
  events: EventBasic[]
  initialRegs: RegistrationFull[]
}

export function RegistrationsClient({ events, initialRegs }: RegistrationsClientProps) {
  const [regs, setRegs] = useState<RegistrationFull[]>(initialRegs)
  const [loading, setLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const handleEventChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = e.target.value
    setSelectedEventId(eventId)
    setLoading(true)
    
    const { data } = await getRegistrationsByEventAction(eventId)
    if (data) {
      setRegs(data)
    }
    setLoading(false)
  }

  const filteredRegs = regs.filter(r => 
    r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.event_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const exportToCSV = () => {
    if (filteredRegs.length === 0) return

    const headers = ["Registration ID", "Date", "Event", "Student Name", "Roll Number", "Email", "Phone", "Team Name"]
    const csvRows = []
    csvRows.push(headers.join(","))

    for (const r of filteredRegs) {
      const row = [
        r.id,
        new Date(r.created_at).toLocaleString().replace(/,/g, ''),
        `"${r.event_title}"`,
        `"${r.student_name}"`,
        `"${r.roll_number}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${r.team_name || 'Individual'}"`
      ]
      csvRows.push(row.join(","))
    }

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    
    const eventName = selectedEventId === "all" ? "all_events" : events.find(e => e.id === selectedEventId)?.title || "event"
    const safeName = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    
    link.setAttribute("download", `registrations_${safeName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Registrations Manager</h1>
          <p className="text-sm text-muted-foreground">Review, search, and export bulk student registrations across all events.</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredRegs.length === 0}
          className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
          title="Export CSV"
        >
          <Download className="h-4 w-4" />
          Export CSV Roster
        </button>
      </div>

      {/* Registrations List Card */}
      <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-xs transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={selectedEventId}
              onChange={handleEventChange}
              disabled={loading}
              className="bg-background text-xs font-semibold border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary text-foreground w-full sm:w-auto"
            >
              <option value="all">All Events</option>
              {events.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.title}</option>
              ))}
            </select>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </div>

        {filteredRegs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
            {loading ? "Loading registrations..." : "No registrations found."}
          </div>
        ) : (
          <div className="overflow-x-auto border border-border/50 rounded-2xl">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-background/40 text-xs font-bold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Date</th>
                  <th className="px-6 py-4">Student Info</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Event Link</th>
                  <th className="px-6 py-4">Roster Status</th>
                  <th className="px-6 py-4 rounded-tr-2xl text-right">Registration ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {filteredRegs.map((reg) => (
                  <tr key={reg.id} className="hover:bg-card/10 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(reg.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground whitespace-nowrap">{reg.student_name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{reg.roll_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-foreground whitespace-nowrap">{reg.email}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{reg.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[200px] text-foreground font-medium">{reg.event_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {reg.team_name ? (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[120px]">{reg.team_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Ticket className="h-3.5 w-3.5 shrink-0" />
                          <span>Individual Entry</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-muted-foreground uppercase whitespace-nowrap">
                      #{reg.id.substring(0, 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

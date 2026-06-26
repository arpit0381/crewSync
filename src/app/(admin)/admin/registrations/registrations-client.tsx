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
  department: string
  section: string
  team_name: string | null
  team_id: string | null
  is_captain: boolean
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
  const [viewMode, setViewMode] = useState<"list" | "teams">("list")

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

    const headers = ["Registration ID", "Date", "Event", "Student Name", "Roll Number", "Email", "Phone", "Department", "Section", "Team Name"]
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
        `"${r.department}"`,
        `"${r.section}"`,
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
            
            <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "list" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("teams")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  viewMode === "teams" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-3.5 w-3.5" /> Teams
              </button>
            </div>

            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </div>

        {filteredRegs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
            {loading ? "Loading registrations..." : "No registrations found."}
          </div>
        ) : viewMode === "teams" ? (
          <div className="space-y-6">
            {Array.from(
              filteredRegs.reduce((map, reg) => {
                const key = reg.team_id || "individual"
                if (!map.has(key)) map.set(key, [])
                map.get(key)!.push(reg)
                return map
              }, new Map<string, RegistrationFull[]>())
            ).map(([teamId, members]) => {
              const teamName = teamId === "individual" ? "Individual Registrations" : members[0]?.team_name || "Unknown Team"
              const captain = members.find(m => m.is_captain)
              
              return (
                <div key={teamId} className="border border-border/50 rounded-2xl bg-card overflow-hidden">
                  <div className="bg-muted/30 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        {teamId !== "individual" ? <Users className="h-5 w-5 text-primary" /> : <Ticket className="h-5 w-5 text-muted-foreground" />}
                        {teamName}
                      </h3>
                      {teamId !== "individual" && captain && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Captain: <span className="font-semibold text-foreground">{captain.student_name}</span> ({captain.roll_number})
                        </p>
                      )}
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                      {members.length} {members.length === 1 ? "Member" : "Members"}
                    </div>
                  </div>
                  
                  <div className="divide-y divide-border/30">
                    {members.map(member => (
                      <div key={member.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${member.is_captain ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {member.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                              {member.student_name}
                              {member.is_captain && <span className="text-[9px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">Captain</span>}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{member.roll_number} • {member.department} {member.section !== "N/A" ? `(${member.section})` : ""}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <p className="font-mono">{member.phone}</p>
                          <p className="truncate max-w-[200px]">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <>
            {/* Desktop Table Layout */}
            <div className="overflow-x-auto border border-border/50 rounded-2xl hidden md:block">
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
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {reg.department} {reg.section !== "N/A" && reg.section ? `(Sec ${reg.section})` : ""}
                          </p>
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
                            {reg.is_captain && <span className="bg-primary/20 px-1 py-0.5 rounded text-[8px] uppercase">Capt</span>}
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

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {filteredRegs.map((reg) => (
                <div key={reg.id} className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm flex items-center gap-1">
                        {reg.student_name}
                        {reg.is_captain && <span className="bg-primary/20 text-primary px-1 py-0.5 rounded text-[8px] uppercase">Captain</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">{reg.roll_number}</p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase bg-background border border-border px-2 py-0.5 rounded-md">
                      #{reg.id.substring(0, 8)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs border-y border-border/50 py-2.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground truncate">{reg.event_title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Type:</span>
                      {reg.team_name ? (
                        <span className="text-primary font-semibold flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {reg.team_name}
                        </span>
                      ) : (
                        <span className="text-foreground flex items-center gap-1">
                          <Ticket className="h-3.5 w-3.5" /> Individual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Dept:</span>
                      <span className="text-foreground">{reg.department} {reg.section !== "N/A" && reg.section ? `(Sec ${reg.section})` : ""}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
                    <p className="truncate">Email: <span className="text-foreground font-medium">{reg.email}</span></p>
                    <p>Phone: <span className="text-foreground font-mono">{reg.phone}</span></p>
                    <div className="flex justify-between border-t border-border/30 pt-2 text-[10px]">
                      <span>Reg Date:</span>
                      <span className="text-foreground font-medium">
                        {new Date(reg.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

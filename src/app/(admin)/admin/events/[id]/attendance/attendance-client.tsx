"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Search, CheckCircle2, XCircle, Download, Users, TicketCheck, ShieldAlert } from "lucide-react"

type Participant = {
  user_id: string;
  name: string;
  roll_number: string;
  email: string;
  section?: string;
  department_name?: string;
  team_name?: string;
  status: "Present" | "Absent";
  checked_in_at?: string;
  checked_in_by_name?: string;
}

interface AttendanceClientProps {
  event: {
    id: string;
    title: string;
    reg_type: string;
    event_date: string;
    event_time: string;
    status: string;
  };
  participants: Participant[];
  stats: {
    totalRegistered: number;
    totalPresent: number;
    totalAbsent: number;
  };
}

export function AttendanceClient({ event, participants, stats }: AttendanceClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"All" | "Present" | "Absent">("All")

  const filteredParticipants = React.useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = 
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (p.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.team_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === "All" || p.status === statusFilter

      return matchesSearch && matchesStatus
    }).sort((a, b) => {
      // Sort by status (Present first), then by name
      if (a.status === b.status) return (a.name || "").localeCompare(b.name || "")
      return a.status === "Present" ? -1 : 1
    })
  }, [participants, searchTerm, statusFilter])

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Roll Number",
      "Email",
      "Department",
      "Section",
      "Team Name",
      "Status",
      "Check-in Time",
      "Checked-in By"
    ]
    
    const rows = filteredParticipants.map(p => [
      p.name || "-",
      p.roll_number || "-",
      p.email || "-",
      p.department_name || "-",
      p.section || "-",
      p.team_name || "-",
      p.status,
      p.checked_in_at ? new Date(p.checked_in_at).toLocaleString() : "-",
      p.checked_in_by_name || "-"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `attendance_${event.title.replace(/\s+/g, '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const attendanceRate = stats.totalRegistered > 0 
    ? Math.round((stats.totalPresent / stats.totalRegistered) * 100) 
    : 0

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div>
          <Link 
            href="/admin/events" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                {event.title} 
                <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                  {event.reg_type}
                </span>
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <TicketCheck className="h-4 w-4" />
                Attendance Dashboard • {event.event_date} at {event.event_time}
              </p>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Users className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold">Total Registered</h3>
            </div>
            <p className="text-4xl font-black text-foreground">{stats.totalRegistered}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-green-500 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-semibold">Total Present</h3>
            </div>
            <p className="text-4xl font-black text-green-400">{stats.totalPresent}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-red-500 mb-2">
              <XCircle className="h-5 w-5" />
              <h3 className="font-semibold">Total Absent</h3>
            </div>
            <p className="text-4xl font-black text-red-400">{stats.totalAbsent}</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 text-primary mb-2 relative z-10">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="font-semibold">Attendance Rate</h3>
            </div>
            <p className="text-4xl font-black text-primary relative z-10">{attendanceRate}%</p>
            
            {/* Background Progress Bar */}
            <div className="absolute inset-0 z-0 opacity-20 bg-background" />
            <div 
              className="absolute inset-y-0 left-0 z-0 bg-primary/30 transition-all duration-1000 ease-out"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card/50 backdrop-blur-md border border-border p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, roll no, or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
        
        <div className="flex bg-background border border-border rounded-xl p-1 w-full sm:w-auto overflow-x-auto">
          {(["All", "Present", "Absent"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                statusFilter === filter 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card/40 backdrop-blur-sm border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Info</th>
                {event.reg_type === "team" && <th className="px-6 py-4 font-semibold">Team</th>}
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Checked In At</th>
                <th className="px-6 py-4 font-semibold hidden lg:table-cell">Checked In By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No participants found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => (
                  <tr key={`${p.user_id}-${idx}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-base">{p.name || "Unknown Student"}</div>
                      <div className="text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-primary">{p.roll_number || "N/A"}</span>
                        <span className="text-xs">{p.department_name || "No Dept"} {p.section ? `• Sec ${p.section}` : ""}</span>
                      </div>
                    </td>
                    {event.reg_type === "team" && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {p.team_name || "No Team"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {p.status === "Present" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="h-3.5 w-3.5" /> Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {p.checked_in_at ? (
                        <div className="text-xs">
                          <div className="font-semibold text-foreground">
                            {new Date(p.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(p.checked_in_at).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground text-xs">
                      {p.checked_in_by_name || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

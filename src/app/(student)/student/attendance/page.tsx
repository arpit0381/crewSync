import { createClient } from "@/lib/supabase/server"
import { CheckSquare, Calendar, MapPin, Clock, Award, ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"


export default async function StudentAttendancePage() {
  let dbLogs: any[] = []
  let totalRegistered = 0
  let totalCheckedIn = 0

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Fetch registrations
      const { data: registrations } = await supabase
        .from("registrations")
        .select(`
          event_id,
          events (
            title,
            event_date,
            venue
          )
        `)
        .eq("user_id", user.id)

      if (registrations) {
        totalRegistered = registrations.length

        // Fetch attendance entries
        const { data: attendance } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", user.id)

        if (attendance) {
          totalCheckedIn = attendance.length

          dbLogs = registrations.map((reg: any) => {
            const attEntry = attendance.find((att) => att.event_id === reg.event_id)
            return {
              id: attEntry?.id || reg.event_id,
              event_title: reg.events?.title || "Event",
              event_date: reg.events?.event_date || "-",
              venue: reg.events?.venue || "-",
              scanned_at: attEntry?.scanned_at || null,
              status: attEntry ? "verified" : "pending"
            }
          })
        }
      }
    }
  } catch (err) {
    console.warn("Using mock attendance due to DB connection:", err)
  }

  const logs = dbLogs
  const attendanceRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">My Attendance Tracker</h1>
        <p className="text-sm text-muted-foreground">Review scan logs and check-in confirmation statuses for claimed certificates eligibility.</p>
      </div>

      {/* Stats Panel */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registered Events</p>
            <p className="text-2xl font-bold text-foreground">{totalRegistered}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Checked In</p>
            <p className="text-2xl font-bold text-foreground">{totalCheckedIn}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
            <p className="text-2xl font-bold text-foreground">{attendanceRate}%</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 overflow-hidden">
        <h2 className="text-lg font-bold text-foreground mb-4">Event Check-In History</h2>
        
        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No attendance entries logged. Register for an event and present your ticket to organizers.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block border border-border/50 rounded-2xl">
              <table className="w-full text-left text-sm text-foreground">
                <thead className="bg-background/40 text-xs font-bold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Event</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Event Date</th>
                    <th className="px-6 py-4">Scanned Time</th>
                    <th className="px-6 py-4 rounded-tr-2xl text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-card/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[200px]">{log.event_title}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{log.venue}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{log.event_date}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {log.scanned_at ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>
                              {new Date(log.scanned_at).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          log.status === "verified"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-background border border-border text-muted-foreground"
                        }`}>
                          {log.status === "verified" ? "Checked In" : "Pending Check-In"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-foreground text-sm">{log.event_title}</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      log.status === "verified"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-background border border-border text-muted-foreground"
                    }`}>
                      {log.status === "verified" ? "Checked In" : "Pending"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs border-t border-border/50 pt-2.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground">{log.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground">{log.event_date}</span>
                    </div>
                    {log.scanned_at && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-foreground">
                          {new Date(log.scanned_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    )}
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

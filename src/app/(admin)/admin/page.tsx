import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsCharts } from "@/components/dynamic-imports"
import { Calendar, Users, CheckSquare, Trophy, Plus, ArrowUpRight } from "lucide-react"

async function getAdminData() {
  try {
    const supabase = await createClient()

    // Run all count queries in parallel
    const [eventsResult, regResult, attResult, usersResult, recentEventsResult] = await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("registrations").select("*", { count: "exact", head: true }),
      supabase.from("attendance").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("events").select("id, title, capacity, status, categories(name), registrations(count)").order('created_at', { ascending: false }).limit(5)
    ])

    // Fetch data for charts
    const [profiles, registrations, attendance] = await Promise.all([
      supabase.from("profiles").select("departments(name)"),
      supabase.from("registrations").select("created_at"),
      supabase.from("attendance").select("checked_in_at")
    ])

    // Grouping logic for deptData
    const deptCounts: Record<string, number> = {}
    if (profiles.data) {
      profiles.data.forEach(p => {
        const dName = (p.departments as any)?.name || "Unknown"
        deptCounts[dName] = (deptCounts[dName] || 0) + 1
      })
    }
    const deptData = Object.entries(deptCounts).map(([name, students]) => ({ name: name.substring(0, 10), students }))

    // Grouping logic for trendData (Days of week)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const trendMap: Record<string, { registrations: number, checkins: number }> = {}
    days.forEach(d => trendMap[d] = { registrations: 0, checkins: 0 })
    
    if (registrations.data) {
      registrations.data.forEach(r => {
        const d = new Date(r.created_at).getDay()
        trendMap[days[d]].registrations += 1
      })
    }
    if (attendance.data) {
      attendance.data.forEach(a => {
        const d = new Date(a.checked_in_at).getDay()
        trendMap[days[d]].checkins += 1
      })
    }
    const trendData = days.map(d => ({ name: d, ...trendMap[d] }))

    return {
      eventsCount: eventsResult.count || 0,
      regCount: regResult.count || 0,
      attCount: attResult.count || 0,
      usersCount: usersResult.count || 0,
      recentEvents: recentEventsResult.data || [],
      deptData,
      trendData
    }
  } catch (err) {
    console.error("Failed to fetch admin data", err)
    return null
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminData() || { 
    eventsCount: 0, regCount: 0, attCount: 0, usersCount: 0, 
    recentEvents: [], deptData: [], trendData: [] 
  }
  
  // Calculate attendance rate
  const attendanceRate = stats.regCount > 0 ? Math.round((stats.attCount / stats.regCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">Real-time statistics for college events and tournaments.</p>
        </div>
        <div>
          <Link
            href="/admin/events"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Events</p>
            <p className="text-2xl font-bold text-foreground">{stats.eventsCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Signups</p>
            <p className="text-2xl font-bold text-foreground">{stats.regCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Checked In</p>
            <p className="text-2xl font-bold text-foreground">{stats.attCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
            <p className="text-2xl font-bold text-foreground">{attendanceRate}%</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Trophy className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Panel */}
      <AnalyticsCharts trendData={stats.trendData} deptData={stats.deptData} />

      {/* Main Grid split */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 cols: Recent Event Statuses */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Live Event Statuses</h2>
            <Link href="/admin/events" className="text-xs font-semibold text-primary hover:underline">
              Manage Events
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-muted-foreground">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Registrations</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stats.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">No events found.</td>
                  </tr>
                ) : (
                  stats.recentEvents.map((evt: any) => {
                    const regCount = evt.registrations?.[0]?.count || 0
                    const catName = evt.categories?.name || "General"
                    
                    let statusColor = "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground"
                    if (evt.status === "published") statusColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    if (evt.status === "pending_approval") statusColor = "bg-amber-500/10 border-amber-500/20 text-amber-400"

                    return (
                      <tr key={evt.id} className="hover:bg-card/40">
                        <td className="py-3.5 px-4 font-semibold text-foreground">{evt.title}</td>
                        <td className="py-3.5 px-4">{catName}</td>
                        <td className="py-3.5 px-4">{regCount} / {evt.capacity}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                            {evt.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right col: Administrative Actions */}
        <div className="rounded-2xl border border-border bg-card/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Administrative Actions</h2>
          <div className="grid gap-2">
            <Link
              href="/admin/attendance"
              className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-4 hover:border-border transition-all group"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">QR Scanner Portal</p>
                <p className="text-xs text-muted-foreground">Scan student tickets for entry.</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/admin/certificates"
              className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-4 hover:border-border transition-all group"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Certificate Engine</p>
                <p className="text-xs text-muted-foreground">Generate bulk verified PDFs.</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

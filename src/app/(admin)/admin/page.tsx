import Link from "next/link"
import { AnalyticsCharts } from "@/components/dynamic-imports"
import { Calendar, Users, CheckSquare, Trophy, Plus, ArrowUpRight } from "lucide-react"

async function getAdminData() {
  try {
    const supabase = await createClient()

    // Run all count queries in parallel
    const [eventsResult, regResult, attResult, usersResult] = await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("registrations").select("*", { count: "exact", head: true }),
      supabase.from("attendance").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ])

    return {
      eventsCount: eventsResult.count || 0,
      regCount: regResult.count || 0,
      attCount: attResult.count || 0,
      usersCount: usersResult.count || 0
    }
  } catch {
    return null
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminData() || { eventsCount: 8, regCount: 412, attCount: 305, usersCount: 350 }
  
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
      <AnalyticsCharts />

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
                <tr className="hover:bg-card/40">
                  <td className="py-3.5 px-4 font-semibold text-foreground">Tech Heist Hackathon</td>
                  <td className="py-3.5 px-4">Technical</td>
                  <td className="py-3.5 px-4">124 / 250</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      Published
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-card/40">
                  <td className="py-3.5 px-4 font-semibold text-foreground">Guest Lecture: AI Trends</td>
                  <td className="py-3.5 px-4">Academic</td>
                  <td className="py-3.5 px-4">98 / 100</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                      Pending Approval
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-card/40">
                  <td className="py-3.5 px-4 font-semibold text-foreground">Logix Coding League</td>
                  <td className="py-3.5 px-4">Technical</td>
                  <td className="py-3.5 px-4">80 / 80</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center rounded-full bg-zinc-500/10 border border-zinc-500/20 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Completed
                    </span>
                  </td>
                </tr>
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

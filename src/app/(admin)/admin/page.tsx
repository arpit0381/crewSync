import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsCharts } from "@/components/dynamic-imports"
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  Trophy, 
  Plus, 
  ArrowUpRight, 
  MessageSquare,
  Sparkles,
  Inbox,
  Clock
} from "lucide-react"

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

    // Safe Contacts fetch (fallback if table doesn't exist yet)
    let unreadContactsCount = 0
    let recentContacts: any[] = []

    try {
      const [unreadRes, recentRes] = await Promise.all([
        supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "unread"),
        supabase.from("contact_submissions").select("id, name, email, subject, category, vibe, status, created_at").order("created_at", { ascending: false }).limit(5)
      ])
      
      if (!unreadRes.error) {
        unreadContactsCount = unreadRes.count || 0
      }
      if (!recentRes.error && recentRes.data) {
        recentContacts = recentRes.data
      }
    } catch (contactsErr) {
      console.warn("Could not fetch contact submissions (migration may not be applied):", contactsErr)
    }

    return {
      eventsCount: eventsResult.count || 0,
      regCount: regResult.count || 0,
      attCount: attResult.count || 0,
      usersCount: usersResult.count || 0,
      recentEvents: recentEventsResult.data || [],
      deptData,
      trendData,
      unreadContactsCount,
      recentContacts
    }
  } catch (err) {
    console.error("Failed to fetch admin data", err)
    return null
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminData() || { 
    eventsCount: 0, regCount: 0, attCount: 0, usersCount: 0, 
    recentEvents: [], deptData: [], trendData: [],
    unreadContactsCount: 0, recentContacts: []
  }
  
  // Calculate attendance rate
  const attendanceRate = stats.regCount > 0 ? Math.round((stats.attCount / stats.regCount) * 100) : 0

  return (
    <div className="space-y-6 min-w-0 w-full overflow-x-hidden">
      {/* Top Banner & Quick Action */}
      <div className="relative rounded-3xl bg-card border border-border p-6 md:p-8 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute -top-[40%] -right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Admin Overview
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Real-time statistics, registrations, attendance rates, and departments overview for college events and tournaments.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </div>
        </div>
        <div className="hidden md:block relative w-44 h-28 shrink-0 z-10">
          <img 
            src="/icons/undraw_charts_31si.svg" 
            alt="Overview analytics charts illustration" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between col-span-2 lg:col-span-1">
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

        {/* New 5th Card for Contacts */}
        <Link 
          href="/admin/contacts"
          className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-between hover:scale-[1.02] hover:bg-card/60 transition-all cursor-pointer group col-span-2 lg:col-span-1"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">Pending Inquiries</p>
            <p className="text-2xl font-bold text-foreground">{stats.unreadContactsCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-all">
            <MessageSquare className="h-5 w-5" />
          </div>
        </Link>
      </div>

      {/* Analytics Charts Panel */}
      <AnalyticsCharts trendData={stats.trendData} deptData={stats.deptData} />

      {/* Main Grid split */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 cols: Recent Event Statuses */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card/20 p-6 space-y-4 min-w-0 overflow-hidden">
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
        <div className="rounded-2xl border border-border bg-card/20 p-6 space-y-4 min-w-0 overflow-hidden">
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

      {/* New Split Row for Contact Submissions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 cols: Recent Contact Inquiries */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card/20 p-6 space-y-4 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent Contact Inquiries</h2>
              <p className="text-xs text-muted-foreground">Latest inquiries from students and collaborators.</p>
            </div>
            <Link href="/admin/contacts" className="text-xs font-semibold text-primary hover:underline">
              View All Inquiries
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/50 bg-background/25">
            <table className="w-full border-collapse text-left text-sm text-muted-foreground">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-card/50">
                <tr>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {stats.recentContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">No recent contact inquiries found.</td>
                  </tr>
                ) : (
                  stats.recentContacts.map((contact: any) => {
                    let statusColor = "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    if (contact.status === "read") statusColor = "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    if (contact.status === "resolved") statusColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"

                    let vibeColor = "bg-primary/10 border-primary/20 text-primary"
                    if (contact.vibe === "urgent") vibeColor = "bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold"
                    if (contact.vibe === "browsing") vibeColor = "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground"

                    const getLabel = (c: string) => {
                      if (c === "collaboration") return "Collaboration"
                      if (c === "support") return "Support"
                      if (c === "feedback") return "Feedback"
                      if (c === "join") return "Join Team"
                      return "General Query"
                    }

                    return (
                      <tr key={contact.id} className="hover:bg-card/30">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-xs font-semibold text-foreground">{contact.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{contact.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold">{getLabel(contact.category)}</td>
                        <td className="py-3 px-4 text-xs font-medium text-foreground truncate max-w-[150px]">{contact.subject}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold capitalize ${vibeColor}`}>
                            {contact.vibe}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                            {contact.status}
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

        {/* Right 1 col: System Integration & Live Health Status */}
        <div className="rounded-2xl border border-border bg-card/20 p-6 space-y-4 min-w-0 overflow-hidden">
          <h2 className="text-lg font-bold text-foreground">System Integration</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Crew Sync connects event ticketing, tournament brackets, bulk certs, and student inquiries under a single campus cloud.
          </p>
          <div className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Database Sync Status</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
              <span className="font-semibold text-muted-foreground">Support Pipeline</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
              <span className="font-semibold text-muted-foreground">Email Dispatch</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createAdminClient } from "@/lib/supabase/server"
import { Ticket, Users, Calendar, Download, Search, RefreshCw } from "lucide-react"

export const dynamic = "force-dynamic"


export default async function AdminRegistrationsPage() {
  let dbRegs: any[] = []

  try {
    const supabase = createAdminClient()
    const { data: registrations } = await supabase
      .from("registrations")
      .select(`
        id,
        created_at,
        events (
          title,
          reg_type
        ),
        profiles (
          name,
          roll_number
        ),
        teams (
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (registrations && registrations.length > 0) {
      dbRegs = registrations.map((r: any) => ({
        id: r.id,
        created_at: r.created_at,
        event_title: r.events?.title || "Campus Event",
        reg_type: r.events?.reg_type || "individual",
        student_name: r.profiles?.name || "Student",
        roll_number: r.profiles?.roll_number || "N/A",
        team_name: r.teams?.name || null
      }))
    }
  } catch (err) {
    console.warn("Using mock registrations due to DB connection:", err)
  }

  const regs = dbRegs

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Registrations Manager</h1>
          <p className="text-sm text-muted-foreground">Review, search, and export bulk student registrations across all events.</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
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
              placeholder="Search student or event..."
              className="pl-10 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-xs transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="bg-background text-xs font-semibold border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary text-foreground w-full sm:w-auto">
              <option value="all">All Registration Types</option>
              <option value="individual">Individual Entry Only</option>
              <option value="team">Team Entry Only</option>
            </select>
          </div>
        </div>

        {regs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
            No registrations found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border/50 rounded-2xl">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-background/40 text-xs font-bold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Date</th>
                  <th className="px-6 py-4">Student Info</th>
                  <th className="px-6 py-4">Event Link</th>
                  <th className="px-6 py-4">Roster Status</th>
                  <th className="px-6 py-4 rounded-tr-2xl text-right">Registration ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {regs.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-card/10 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(reg.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{reg.student_name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{reg.roll_number}</p>
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
                    <td className="px-6 py-4 text-right font-mono text-xs text-muted-foreground uppercase">
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

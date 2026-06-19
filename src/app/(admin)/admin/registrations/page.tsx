import { createClient } from "@/lib/supabase/server"
import { Ticket, Users, Calendar, Download, Search, RefreshCw } from "lucide-react"

export const dynamic = "force-dynamic"

const MOCK_REGS = [
  {
    id: "reg-mock-1",
    created_at: "2026-06-19T10:15:00Z",
    event_title: "Tech Heist 2026",
    reg_type: "team",
    student_name: "Arpit Bajpai",
    roll_number: "CRA-2026-00125",
    team_name: "Code Commandos"
  },
  {
    id: "reg-mock-2",
    created_at: "2026-06-19T09:40:00Z",
    event_title: "Introduction to Edge Computing & AI",
    reg_type: "individual",
    student_name: "Jane Doe",
    roll_number: "CRA-2026-00344",
    team_name: null
  },
  {
    id: "reg-mock-3",
    created_at: "2026-06-18T14:22:00Z",
    event_title: "Valorant Campus Arena",
    reg_type: "team",
    student_name: "Sarah Connor",
    roll_number: "CRA-2026-00561",
    team_name: "Logix Esports"
  }
]

export default async function AdminRegistrationsPage() {
  let dbRegs: any[] = []

  try {
    const supabase = await createClient()
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

  const regs = dbRegs.length > 0 ? dbRegs : MOCK_REGS

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Registrations Manager</h1>
          <p className="text-sm text-zinc-400">Review, search, and export bulk student registrations across all events.</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all cursor-pointer"
          title="Export CSV"
        >
          <Download className="h-4 w-4" />
          Export CSV Roster
        </button>
      </div>

      {/* Registrations List Card */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search student or event..."
              className="pl-10 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-primary focus:outline-none text-xs transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="bg-zinc-950 text-xs font-semibold border border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary text-zinc-300 w-full sm:w-auto">
              <option value="all">All Registration Types</option>
              <option value="individual">Individual Entry Only</option>
              <option value="team">Team Entry Only</option>
            </select>
          </div>
        </div>

        {regs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-850 rounded-2xl">
            No registrations found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-850/50 rounded-2xl">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/40 text-xs font-bold uppercase text-zinc-400 border-b border-zinc-800">
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
                  <tr key={reg.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(reg.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white">{reg.student_name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{reg.roll_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                        <span className="truncate max-w-[200px] text-zinc-300 font-medium">{reg.event_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {reg.team_name ? (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[120px]">{reg.team_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Ticket className="h-3.5 w-3.5 shrink-0" />
                          <span>Individual Entry</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-zinc-500 uppercase">
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

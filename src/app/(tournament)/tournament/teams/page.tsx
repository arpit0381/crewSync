import { createClient } from "@/lib/supabase/server"
import { Users, Clipboard, Mail, Phone } from "lucide-react"


export default async function TournamentTeamsPage() {
  let dbTeams: any[] = []

  try {
    const supabase = await createClient()
    const { data: teams } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        invite_code,
        event:event_id (title),
        captain:captain_id (name, email, mobile),
        team_members (count)
      `)

    if (teams && teams.length > 0) {
      dbTeams = teams.map((t: any) => ({
        id: t.id,
        name: t.name,
        invite_code: t.invite_code,
        captain: {
          name: t.captain?.name || "Unknown",
          email: t.captain?.email || "-",
          mobile: t.captain?.mobile || "-"
        },
        member_count: t.team_members?.[0]?.count || 1,
        event_title: t.event?.title || "Campus Event"
      }))
    }
  } catch (err) {
    console.warn("Using mock teams in teams manager:", err)
  }

  const teams = dbTeams

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Team Manager</h1>
        <p className="text-sm text-zinc-400">View team captains, invite codes, and roster lists.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{team.name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{team.event_title}</p>
              </div>
              <div className="bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Invite Code</span>
                <p className="text-sm font-mono font-bold text-primary tracking-wider">{team.invite_code}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 uppercase font-semibold">Captain Details</span>
                <span className="text-zinc-300 font-bold">{team.captain.name}</span>
              </div>

              <div className="space-y-1.5 pl-2 border-l border-zinc-850">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{team.captain.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{team.captain.mobile}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-850">
                <span className="text-zinc-500 uppercase font-semibold">Squad Count</span>
                <span className="text-zinc-300 font-bold">{team.member_count} Members</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

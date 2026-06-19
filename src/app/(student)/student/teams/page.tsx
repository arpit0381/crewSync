import { createClient } from "@/lib/supabase/server"
import { Users, Shield, Copy, Calendar, Award } from "lucide-react"

export const dynamic = "force-dynamic"


export default async function StudentTeamsPage() {
  let dbTeams: any[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Fetch teams where user is a member
      const { data: memberships } = await supabase
        .from("team_members")
        .select(`
          team_id,
          teams (
            id,
            name,
            invite_code,
            captain_id,
            events (
              title
            )
          )
        `)
        .eq("user_id", user.id)

      if (memberships && memberships.length > 0) {
        for (const m of memberships) {
          const team = (m as any).teams
          if (!team) continue

          // Fetch all members of this team
          const { data: members } = await supabase
            .from("team_members")
            .select(`
              profiles (
                name
              )
            `)
            .eq("team_id", team.id)

          // Fetch captain profile
          const { data: captain } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", team.captain_id)
            .single()

          dbTeams.push({
            id: team.id,
            name: team.name,
            invite_code: team.invite_code,
            captain_name: captain?.name || "Organizer",
            is_captain: team.captain_id === user.id,
            event_title: team.events?.title || "Campus Event",
            members: members?.map((mem: any) => mem.profiles?.name || "Anonymous") || []
          })
        }
      }
    }
  } catch (err) {
    console.warn("Using mock student teams data due to DB connection:", err)
  }

  const teams = dbTeams

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">My Crews & Teams</h1>
        <p className="text-sm text-zinc-400">Manage team registration rosters, copy invite codes, and review crew roles.</p>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500 bg-zinc-900/10">
          <Users className="h-12 w-12 mx-auto text-zinc-700 mb-2" />
          <p>You are not registered in any team events yet.</p>
          <p className="text-xs text-zinc-600 mt-1">Form or join a team during registration of sports or coding events.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                      <Calendar className="h-3 w-3" />
                      {team.event_title}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight mt-1">{team.name}</h3>
                  </div>

                  {team.is_captain && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                      <Shield className="h-3 w-3" />
                      Captain
                    </span>
                  )}
                </div>

                {/* Team Members */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Crew Members ({team.members.length})</span>
                  <ul className="grid grid-cols-2 gap-2">
                    {team.members.map((member: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-950/40 px-3 py-2 rounded-xl border border-zinc-850">
                        <div className="h-2 w-2 rounded-full bg-zinc-500 shrink-0" />
                        <span className="truncate">{member}</span>
                        {member === team.captain_name && (
                          <span className="text-[9px] text-yellow-500 font-bold shrink-0">(C)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Details/Actions */}
              <div className="border-t border-zinc-850 pt-4 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Captain in charge</p>
                  <p className="text-xs font-semibold text-white">{team.captain_name}</p>
                </div>

                {team.is_captain && team.invite_code ? (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 w-full sm:w-auto">
                    <div>
                      <p className="text-[8px] text-zinc-500 uppercase font-semibold">Invite Code</p>
                      <p className="text-sm font-black tracking-widest text-primary font-mono">{team.invite_code}</p>
                    </div>
                    <button
                      onClick={undefined} // Fallback trigger
                      className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                      title="Copy Invite Code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-500 bg-zinc-950/20 px-3 py-1.5 rounded-lg border border-zinc-850">
                    Invite code protected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
    console.warn("Database connection failed when fetching teams:", err)
  }

  const teams = dbTeams

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Team Manager</h1>
        <p className="text-sm text-muted-foreground">View team captains, invite codes, and roster lists.</p>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card/10 flex flex-col items-center justify-center space-y-4">
          <img 
            src="/icons/undraw_join_niai.svg" 
            alt="No squads found" 
            className="w-44 h-44 object-contain opacity-75"
          />
          <div>
            <p className="font-semibold text-foreground">No active squads or teams found.</p>
            <p className="text-xs text-muted-foreground mt-1">Teams will appear here once students form squads for active events.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-3xl border border-border bg-card/20 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{team.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{team.event_title}</p>
                </div>
                <div className="bg-background px-3 py-1 rounded-xl border border-border text-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Invite Code</span>
                  <p className="text-sm font-mono font-bold text-primary tracking-wider">{team.invite_code}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase font-semibold">Captain Details</span>
                  <span className="text-foreground font-bold">{team.captain.name}</span>
                </div>

                <div className="space-y-1.5 pl-2 border-l border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{team.captain.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{team.captain.mobile}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                  <span className="text-muted-foreground uppercase font-semibold">Squad Count</span>
                  <span className="text-foreground font-bold">{team.member_count} Members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
//heheh
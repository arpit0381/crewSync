import { createClient } from "@/lib/supabase/server"
import { TeamsClient } from "@/components/student/teams-client"

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
            min_members,
            max_members,
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
            members: members?.map((mem: any) => mem.profiles?.name || "Anonymous") || [],
            min_members: team.min_members || 1,
            max_members: team.max_members || 1
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">My Crews & Teams</h1>
        <p className="text-sm text-muted-foreground">Manage team registration rosters, copy invite codes, and review crew roles.</p>
      </div>

      <TeamsClient teams={teams} />
    </div>
  )
}

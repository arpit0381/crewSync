import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Flag, Plus, Users, Calendar, ShieldCheck, Award } from "lucide-react"

export const dynamic = "force-dynamic"


async function addClub(formData: FormData) {
  "use server"
  const name = formData.get("name") as string
  
  if (!name) return

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.user_metadata?.role !== 'super_admin') {
      console.error("Unauthorized: Not a super admin")
      return
    }

    const { createAdminClient } = await import("@/lib/supabase/server")
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("clubs")
      .insert({ name })

    if (error) {
      console.error("Error adding club:", error)
      return
    }

    revalidatePath("/admin/clubs")
  } catch (err: any) {
    console.error("Error in addClub action:", err)
  }
}

export default async function AdminClubsPage() {
  let dbClubs: any[] = []

  try {
    const supabase = await createClient()
    const { data: clubs } = await supabase
      .from("clubs")
      .select("*")
      .order("name", { ascending: true })

    if (clubs && clubs.length > 0) {
      for (const c of clubs) {
        // Count club members
        const { count: membersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("club_id", c.id)

        // Count club events
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("club_id", c.id)

        dbClubs.push({
          id: c.id,
          name: c.name,
          total_members: membersCount || 0,
          total_events: eventsCount || 0
        })
      }
    }
  } catch (err) {
    console.warn("Using mock clubs due to DB connection:", err)
  }

  const clubs = dbClubs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Clubs Registry</h1>
        <p className="text-sm text-muted-foreground">Register campus clubs, configure leadership roles, and monitor engagement metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Add Club */}
        <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 flex flex-col justify-between">
          <form action={addClub} className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
              <Flag className="h-4 w-4" />
              <span>Register New Club</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Club Title Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="E.g. Logix Coding Club"
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-sm transition-all"
              />
            </div>

            <div className="pt-2 border-t border-border">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Campus Club
              </button>
            </div>
          </form>

          <div className="text-[10px] text-muted-foreground mt-6 flex items-center gap-1.5 border-t border-border pt-4 leading-relaxed">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            Registered clubs can publish and manage technical or esports tournaments.
          </div>
        </div>

        {/* Right: Clubs Table */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-foreground mb-4">Active Campus Clubs</h2>
          
          <div className="overflow-x-auto border border-border/50 rounded-2xl">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-background/40 text-xs font-bold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Club Name</th>
                  <th className="px-6 py-4">Total Members</th>
                  <th className="px-6 py-4 rounded-tr-2xl text-right">Published Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {clubs.map((c: any) => (
                  <tr key={c.id} className="hover:bg-card/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold text-foreground truncate max-w-[220px]">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{c.total_members} Members</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {c.total_events} Events
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

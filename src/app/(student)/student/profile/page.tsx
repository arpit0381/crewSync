import { createClient } from "@/lib/supabase/server"
import { User, Mail, Phone, BookOpen, Shield, Ticket, Trophy, Award, Building2 } from "lucide-react"

export const dynamic = "force-dynamic"


export default async function StudentProfilePage() {
  let dbProfile: any = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          name,
          roll_number,
          email,
          phone,
          role,
          departments (name),
          clubs (name)
        `)
        .eq("id", user.id)
        .single()

      if (profile) {
        // Query counts
        const { count: regCount } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        const { count: certCount } = await supabase
          .from("certificates")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        const { count: teamCount } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // Fetch recent registrations and certificates
        const [recentRegs, recentCerts] = await Promise.all([
          supabase
            .from("registrations")
            .select("id, created_at, events(title, event_date, venue, categories(name))")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("certificates")
            .select("id, generated_at, cert_type, events(title)")
            .eq("user_id", user.id)
            .order("generated_at", { ascending: false })
            .limit(5)
        ])

        dbProfile = {
          name: profile.name,
          roll_number: profile.roll_number || "Not Assigned",
          email: profile.email || user.email,
          phone: profile.phone || "Not Set",
          role: profile.role,
          department_name: (profile as any).departments?.name || "None",
          club_name: (profile as any).clubs?.name || "None",
          stats: {
            registered: regCount || 0,
            certificates: certCount || 0,
            teams: teamCount || 0
          },
          recentRegs: recentRegs.data || [],
          recentCerts: recentCerts.data || []
        }
      }
    }
  } catch (err) {
    console.warn("Using mock student profile due to DB connection:", err)
  }

  const profile = dbProfile || {
    name: "Guest Student",
    roll_number: "Not Assigned",
    email: "Not Set",
    phone: "Not Set",
    role: "student",
    department_name: "None",
    club_name: "None",
    stats: {
      registered: 0,
      certificates: 0,
      teams: 0
    },
    recentRegs: [],
    recentCerts: []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">My Campus Profile</h1>
        <p className="text-sm text-muted-foreground">View college identity records, roll allocations, and activity statistics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Card: Basic Profile */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-tight">{profile.name}</h2>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground mt-1 capitalize">
                {profile.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">University Roll No</p>
                <p className="text-sm font-semibold text-foreground font-mono mt-0.5">{profile.roll_number}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Email Address</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 truncate max-w-[220px]">{profile.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Mobile Contact</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{profile.phone}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Academic Department</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 leading-tight">{profile.department_name}</p>
              </div>
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Primary Student Club Affiliation</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 leading-tight">{profile.club_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Statistics Summary */}
        <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">Campus Statistics</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Events Registered</span>
                </div>
                <span className="text-lg font-bold text-foreground">{profile.stats.registered}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Certificates Earned</span>
                </div>
                <span className="text-lg font-bold text-foreground">{profile.stats.certificates}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Teams Joined</span>
                </div>
                <span className="text-lg font-bold text-foreground">{profile.stats.teams}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-6 text-[10px] text-muted-foreground text-center leading-relaxed">
            Information linked directly with college administrative systems. Contact campus registrar to update roll allocations.
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Recent Registrations */}
        <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold text-foreground">Recent Registrations</h2>
          </div>
          <div className="space-y-3">
            {profile.recentRegs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-card/10 p-6 text-center text-muted-foreground text-sm">
                No recent event registrations.
              </div>
            ) : (
              profile.recentRegs.map((reg: any) => {
                const event = reg.events
                if (!event) return null
                const catName = event.categories?.name || "Event"
                
                return (
                  <div key={reg.id} className="rounded-xl border border-border/80 bg-card/40 p-4 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        {catName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">Date: {event.event_date} | Venue: {event.venue}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold text-foreground">Recent Certificates</h2>
          </div>
          <div className="space-y-3">
            {profile.recentCerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-card/10 p-6 text-center text-muted-foreground text-sm">
                No certificates earned yet.
              </div>
            ) : (
              profile.recentCerts.map((cert: any) => {
                const event = cert.events
                if (!event) return null
                
                return (
                  <div key={cert.id} className="rounded-xl border border-border/80 bg-card/40 p-4 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                        {cert.cert_type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(cert.generated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

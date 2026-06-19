import { createClient } from "@/lib/supabase/server"
import { User, Mail, Phone, BookOpen, Shield, Ticket, Trophy, Award, Building2 } from "lucide-react"

export const dynamic = "force-dynamic"

const MOCK_PROFILE = {
  name: "Arpit Bajpai",
  roll_number: "CRA-2026-00125",
  email: "arpit.bajpai@campus.edu",
  phone: "+91 9876543210",
  role: "student",
  department_name: "Bachelor of Computer Applications (BCA)",
  club_name: "Logix Coding Club",
  stats: {
    registered: 3,
    certificates: 1,
    teams: 2
  }
}

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
          }
        }
      }
    }
  } catch (err) {
    console.warn("Using mock student profile due to DB connection:", err)
  }

  const profile = dbProfile || MOCK_PROFILE

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">My Campus Profile</h1>
        <p className="text-sm text-zinc-400">View college identity records, roll allocations, and activity statistics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Card: Basic Profile */}
        <div className="md:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-850 pb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{profile.name}</h2>
              <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-400 mt-1 capitalize">
                {profile.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">University Roll No</p>
                <p className="text-sm font-semibold text-white font-mono mt-0.5">{profile.roll_number}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Email Address</p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate max-w-[220px]">{profile.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Mobile Contact</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.phone}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Academic Department</p>
                <p className="text-sm font-semibold text-white mt-0.5 leading-tight">{profile.department_name}</p>
              </div>
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Primary Student Club Affiliation</p>
                <p className="text-sm font-semibold text-white mt-0.5 leading-tight">{profile.club_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Statistics Summary */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-zinc-850 pb-3">Campus Statistics</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Events Registered</span>
                </div>
                <span className="text-lg font-bold text-white">{profile.stats.registered}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Certificates Earned</span>
                </div>
                <span className="text-lg font-bold text-white">{profile.stats.certificates}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Teams Joined</span>
                </div>
                <span className="text-lg font-bold text-white">{profile.stats.teams}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-850 pt-4 mt-6 text-[10px] text-zinc-500 text-center leading-relaxed">
            Information linked directly with college administrative systems. Contact campus registrar to update roll allocations.
          </div>
        </div>
      </div>
    </div>
  )
}

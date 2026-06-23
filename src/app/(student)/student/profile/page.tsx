import { createClient } from "@/lib/supabase/server"
import { StudentProfileClient } from "@/components/student/student-profile-client"

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
          mobile,
          role,
          department_id,
          club_id,
          section,
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
        const [recentRegs, recentCerts, deptsRes, clubsRes] = await Promise.all([
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
            .limit(5),
          supabase.from("departments").select("id, name").order("name"),
          supabase.from("clubs").select("id, name").order("name")
        ])

        dbProfile = {
          name: profile.name,
          roll_number: profile.roll_number || "Not Assigned",
          email: profile.email || user.email,
          mobile: profile.mobile || "Not Set",
          role: profile.role,
          department_id: profile.department_id,
          club_id: profile.club_id,
          section: profile.section,
          department_name: (profile as any).departments?.name || "None",
          club_name: (profile as any).clubs?.name || "None",
          stats: {
            registered: regCount || 0,
            certificates: certCount || 0,
            teams: teamCount || 0
          },
          recentRegs: recentRegs.data || [],
          recentCerts: recentCerts.data || [],
          departments: deptsRes.data || [],
          clubs: clubsRes.data || []
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
    mobile: "Not Set",
    role: "student",
    department_name: "None",
    club_name: "None",
    section: "",
    stats: {
      registered: 0,
      certificates: 0,
      teams: 0
    },
    recentRegs: [],
    recentCerts: [],
    departments: [],
    clubs: []
  }

  return (
    <StudentProfileClient 
      profile={profile} 
      departments={profile.departments || []} 
      clubs={profile.clubs || []} 
    />
  )
}

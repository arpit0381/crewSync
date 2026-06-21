import { createClient } from "@/lib/supabase/server"
import { UsersManagerClient } from "@/components/admin/users-manager-client"

export const dynamic = "force-dynamic"


export default async function AdminUsersPage() {
  let dbUsers: any[] = []

  try {
    const supabase = await createClient()
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, name, roll_number, email, mobile, role")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching profiles:", error)
    }

    if (profiles && profiles.length > 0) {
      dbUsers = profiles.map(p => ({ ...p, phone: p.mobile }))
    }
  } catch (err) {
    console.warn("Using mock users database inside AdminUsersPage:", err)
  }

  const users = dbUsers

  return <UsersManagerClient initialUsers={users} />
}

import { createClient } from "@/lib/supabase/server"
import { UsersManagerClient } from "@/components/admin/users-manager-client"

export const dynamic = "force-dynamic"


export default async function AdminUsersPage() {
  let dbUsers: any[] = []

  try {
    const supabase = await createClient()
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, roll_number, email, phone, role")
      .order("name", { ascending: true })

    if (profiles && profiles.length > 0) {
      dbUsers = profiles
    }
  } catch (err) {
    console.warn("Using mock users database inside AdminUsersPage:", err)
  }

  const users = dbUsers

  return <UsersManagerClient initialUsers={users} />
}

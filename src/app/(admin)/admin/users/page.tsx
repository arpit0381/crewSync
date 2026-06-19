import { createClient } from "@/lib/supabase/server"
import { UsersManagerClient } from "@/components/admin/users-manager-client"

export const dynamic = "force-dynamic"

const MOCK_USERS = [
  { id: "user-mock-1", name: "Arpit Bajpai", roll_number: "CRA-2026-00125", email: "arpit.bajpai@campus.edu", phone: "+91 9876543210", role: "student" },
  { id: "user-mock-2", name: "John Doe", roll_number: "CRA-2026-00344", email: "john.doe@campus.edu", phone: "+91 9999999999", role: "super_admin" },
  { id: "user-mock-3", name: "Sarah Connor", roll_number: "CRA-2026-00561", email: "sarah@campus.edu", phone: "+91 8888888888", role: "tournament_admin" },
  { id: "user-mock-4", name: "Jane Smith", roll_number: "CRA-2026-00789", email: "jane.smith@campus.edu", phone: "+91 7777777777", role: "department_admin" },
  { id: "user-mock-5", name: "Bob Johnson", roll_number: "CRA-2026-00210", email: "bob.johnson@campus.edu", phone: "+91 6666666666", role: "club_admin" }
]

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

  const users = dbUsers.length > 0 ? dbUsers : MOCK_USERS

  return <UsersManagerClient initialUsers={users} />
}

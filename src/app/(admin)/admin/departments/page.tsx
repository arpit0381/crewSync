import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Building, Plus, Award, Users, ShieldAlert, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"


// Server Action inside the same page file
async function addDepartment(formData: FormData) {
  "use server"
  const name = formData.get("name") as string
  const code = formData.get("code") as string
  
  if (!name || !code) return

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check JWT role instead of RLS to prevent issues
    if (user?.user_metadata?.role !== 'super_admin') {
      console.error("Unauthorized: Not a super admin")
      return
    }

    const { createAdminClient } = await import("@/lib/supabase/server")
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("departments")
      .insert({
        name,
        code: code.toUpperCase().trim()
      })

    if (error) {
      console.error("Error inserting department:", error)
      return
    }
    
    revalidatePath("/admin/departments")
  } catch (err: any) {
    console.error("Error in addDepartment action:", err)
  }
}

export default async function AdminDepartmentsPage() {
  let dbDepts: any[] = []

  try {
    const supabase = await createClient()
    
    // Fetch departments
    const { data: departments } = await supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true })

    if (departments && departments.length > 0) {
      for (const d of departments) {
        // Fetch total student count for this department
        const { count: studentsCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("department_id", d.id)

        // Fetch event count for this department
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("department_id", d.id)

        dbDepts.push({
          id: d.id,
          name: d.name,
          code: d.code,
          total_students: studentsCount || 0,
          total_events: eventsCount || 0
        })
      }
    }
  } catch (err) {
    console.warn("Using mock departments due to DB connection:", err)
  }

  const depts = dbDepts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Departments Registry</h1>
        <p className="text-sm text-muted-foreground">Add college academic departments, review registration totals, and monitor event counts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Add Department Form */}
        <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 flex flex-col justify-between">
          <form action={addDepartment} className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Register New Department</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="E.g. Computer Science & IT"
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Academic Code</label>
              <input
                name="code"
                type="text"
                required
                maxLength={10}
                placeholder="E.g. BCA, MCA, CSE"
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-sm transition-all uppercase tracking-wider"
              />
            </div>

            <div className="pt-2 border-t border-border">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Department
              </button>
            </div>
          </form>

          <div className="text-[10px] text-muted-foreground mt-6 flex items-center gap-1 border-t border-border pt-4 leading-relaxed">
            <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            Once registered, students can associate their profiles with this department.
          </div>
        </div>

        {/* Right Column: Departments Table list */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-foreground mb-4">Academic Departments Registry</h2>
          
          <div className="overflow-x-auto border border-border/50 rounded-2xl">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-background/40 text-xs font-bold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Code</th>
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4">Linked Students</th>
                  <th className="px-6 py-4 rounded-tr-2xl text-right">Event Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {depts.map((d: any) => (
                  <tr key={d.id} className="hover:bg-card/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary font-mono uppercase tracking-wider">
                        {d.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[200px]">{d.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{d.total_students} Students</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                        {d.total_events} Events
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

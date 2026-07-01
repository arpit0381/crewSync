import { createClient } from "@/lib/supabase/server"
import { getContactSubmissionsAction } from "@/app/contact-actions"
import { ContactsManagerClient } from "@/components/admin/contacts-manager-client"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminContactsPage() {
  const res = await getContactSubmissionsAction({ status: "all", category: "all" })

  if (res.error) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-2xl mx-auto my-12 space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Failed to load contact submissions</h2>
        <p className="text-sm text-muted-foreground">{res.error}</p>
        <p className="text-xs text-muted-foreground/60">
          Make sure you have run the database migration script in your Supabase dashboard SQL editor.
        </p>
      </div>
    )
  }

  const submissions = res.submissions || []

  return (
    <ContactsManagerClient initialSubmissions={submissions} />
  )
}

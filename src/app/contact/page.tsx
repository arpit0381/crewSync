import { createClient } from "@/lib/supabase/server"
import { ContactClient } from "@/components/contact-client"

export const dynamic = "force-dynamic"

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userEmail = user?.email || undefined
  const userRole = user?.user_metadata?.role || undefined
  const userName = user?.user_metadata?.name || undefined

  return (
    <ContactClient
      userEmail={userEmail}
      userRole={userRole}
      userName={userName}
    />
  )
}

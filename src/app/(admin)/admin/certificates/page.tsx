import { createClient } from "@/lib/supabase/server"
import { CertificateDesignerClient } from "@/components/admin/certificate-designer-client"

export default async function AdminCertificatesPage() {
  let dbEvents: any[] = []
  let dbTemplates: any[] = []
  let dbAttendanceMap: Record<string, any[]> = {}
  let dbCertificatesMap: Record<string, any[]> = {}

  try {
    const supabase = await createClient()

    // Fetch all events (published + completed)
    const { data: events } = await supabase
      .from("events")
      .select("id, title, event_date, status, categories(name)")
      .in("status", ["published", "completed"])
      .order("event_date", { ascending: false })

    if (events?.length) dbEvents = events

    // Fetch existing certificate templates
    const { data: templates } = await supabase
      .from("certificate_templates")
      .select("*")

    if (templates?.length) dbTemplates = templates

    // Fetch attendance per event (eligible participants)
    if (events?.length) {
      for (const event of events) {
        const { data: attendances } = await supabase
          .from("attendance")
          .select("student_id, profiles(id, name, email, roll_number)")
          .eq("event_id", event.id)

        if (attendances?.length) {
          dbAttendanceMap[event.id] = attendances.map((a: any) => ({
            userId: a.student_id,
            name: a.profiles?.name || "Student",
            email: a.profiles?.email || "",
            rollNumber: a.profiles?.roll_number || "",
          }))
        }

        const { data: certs } = await supabase
          .from("certificates")
          .select("id, user_id, cert_type, certificate_number, generated_at")
          .eq("event_id", event.id)

        if (certs?.length) {
          dbCertificatesMap[event.id] = certs
        }
      }
    }
  } catch (err) {
    console.warn("AdminCertificatesPage data fetch error:", err)
  }

  return (
    <CertificateDesignerClient
      events={dbEvents}
      templates={dbTemplates}
      attendanceMap={dbAttendanceMap}
      certificatesMap={dbCertificatesMap}
    />
  )
}

import { createClient } from "@/lib/supabase/server"
import { CertificatesClient } from "@/components/dynamic-imports"

export default async function StudentCertificatesPage() {
  let dbCerts: any[] = []
  let studentName = "Student"

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Get real student name
      const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single()
      if (profile?.name) {
        studentName = profile.name
      }

      // Query attendance verified list with templates (V2 schema)
      const { data: attendances } = await supabase
        .from("attendance")
        .select(`
          event_id,
          events (
            title,
            event_date,
            certificate_templates (
              id,
              theme_id,
              cert_title,
              cert_subtitle,
              description,
              signatory_left_name,
              signatory_left_title,
              signatory_right_name,
              signatory_right_title,
              include_qr,
              status
            )
          )
        `)
        .eq("student_id", user.id)

      if (attendances && attendances.length > 0) {
        // Query already claimed/generated certificates
        const { data: claims } = await supabase
          .from("certificates")
          .select("*")
          .eq("user_id", user.id)

        dbCerts = attendances.map((att: any) => {
          const claim = claims?.find((c) => c.event_id === att.event_id)
          const templates = att.events?.certificate_templates
          const template = Array.isArray(templates) ? templates[0] : templates

          return {
            id: claim?.id,
            event_id: att.event_id,
            event_title: att.events?.title || "Event",
            event_date: att.events?.event_date || "-",
            cert_type: claim?.cert_type || undefined,
            claimed: !!claim,
            attendance_verified: true,
            certificate_number: claim?.certificate_number || null,
            verification_url: claim?.verification_url || null,
            // V2 template data
            theme_id: template?.theme_id || "modern-gold",
            cert_title: template?.cert_title || "Certificate of Completion",
            cert_subtitle: template?.cert_subtitle || "PROUDLY PRESENTED TO",
            description: template?.description || "for participation in the campus event",
            signatory_left_name: template?.signatory_left_name || "Coordinator",
            signatory_left_title: template?.signatory_left_title || "Event Coordinator",
            signatory_right_name: template?.signatory_right_name || "Director",
            signatory_right_title: template?.signatory_right_title || "Campus Director",
            include_qr: template?.include_qr ?? true,
            template_published: template?.status === "published",
          }
        })
      }
    }
  } catch (err) {
    console.warn("Using mock certificates due to DB connection:", err)
  }

  const certificates = dbCerts

  return <CertificatesClient initialCertificates={certificates} studentName={studentName} />
}

import { createClient } from "@/lib/supabase/server"
import { CertificatesClient } from "@/components/student/certificates-client"

const MOCK_CERTS = [
  {
    id: "cert-mock-1234",
    event_id: "evt-99",
    event_title: "Introduction to Edge Computing & AI",
    event_date: "2026-06-18",
    cert_type: "participation" as const,
    claimed: true,
    attendance_verified: true,
    template_url: null,
    title_coords: null,
    name_coords: null,
    date_coords: null
  },
  {
    event_id: "evt-1",
    event_title: "Tech Heist Hackathon",
    event_date: "2026-07-15",
    claimed: false,
    attendance_verified: true,
    template_url: null,
    title_coords: null,
    name_coords: null,
    date_coords: null
  },
  {
    event_id: "evt-3",
    event_title: "Valorant Campus Arena",
    event_date: "2026-07-28",
    claimed: false,
    attendance_verified: false,
    template_url: null,
    title_coords: null,
    name_coords: null,
    date_coords: null
  }
]

export default async function StudentCertificatesPage() {
  let dbCerts: any[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Query attendance verified list with templates
      const { data: attendances } = await supabase
        .from("attendance")
        .select(`
          event_id,
          events (
            title,
            event_date,
            certificate_templates (
              id,
              template_url,
              title_coords_json,
              name_coords_json,
              date_coords_json
            )
          )
        `)
        .eq("student_id", user.id)

      if (attendances && attendances.length > 0) {
        // Query already claimed certificates
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
            template_url: template?.template_url || null,
            title_coords: template?.title_coords_json || null,
            name_coords: template?.name_coords_json || null,
            date_coords: template?.date_coords_json || null
          }
        })
      }
    }
  } catch (err) {
    console.warn("Using mock certificates due to DB connection:", err)
  }

  const certificates = dbCerts.length > 0 ? dbCerts : MOCK_CERTS

  return <CertificatesClient initialCertificates={certificates} />
}

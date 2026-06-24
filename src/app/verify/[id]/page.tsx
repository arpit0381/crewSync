import { createClient } from "@/lib/supabase/server"
import { Award, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { getCertTypeLabel, formatCertDate } from "@/lib/certificate-utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  const { id } = await params
  let certificate: any = null
  let valid = false

  try {
    const supabase = await createClient()

    const { data: cert, error } = await supabase
      .from("certificates")
      .select(`
        id,
        cert_type,
        certificate_number,
        verification_url,
        generated_at,
        events (
          title,
          event_date,
          venue
        ),
        profiles (
          name,
          roll_number,
          departments (name)
        )
      `)
      .eq("id", id)
      .maybeSingle()

    if (cert && !error) {
      certificate = cert
      valid = true
    }
  } catch (err) {
    console.error("Verification page error:", err)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-lg font-extrabold tracking-wider text-foreground">
            CREW <span className="text-primary">SYNC</span>
          </span>
          <p className="text-xs text-muted-foreground mt-1">Certificate Verification Portal</p>
        </div>

        {valid && certificate ? (
          <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm overflow-hidden">
            {/* Status Banner */}
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-400">Certificate Verified</p>
                <p className="text-[10px] text-emerald-400/70">This certificate is authentic and valid</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Certificate Icon */}
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <DetailRow label="Student Name" value={(certificate.profiles as any)?.name || "—"} />
                <DetailRow label="Roll Number" value={(certificate.profiles as any)?.roll_number || "—"} />
                <DetailRow label="Department" value={(certificate.profiles as any)?.departments?.name || "—"} />
                <DetailRow label="Event" value={(certificate.events as any)?.title || "—"} />
                <DetailRow label="Event Date" value={formatCertDate((certificate.events as any)?.event_date || "")} />
                <DetailRow label="Venue" value={(certificate.events as any)?.venue || "—"} />
                <DetailRow label="Certificate Type" value={getCertTypeLabel(certificate.cert_type)} highlight />
                <DetailRow label="Certificate Number" value={certificate.certificate_number || "—"} mono />
                <DetailRow label="Issue Date" value={formatCertDate(certificate.generated_at)} />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border text-center">
                <p className="text-[10px] text-muted-foreground">
                  Verified on {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-[9px] text-muted-foreground mt-1">
                  Certificate ID: {certificate.id}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Certificate Not Found</p>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                The certificate ID provided does not match any records. It may have been revoked or the link is incorrect.
              </p>
            </div>
            <div className="text-[10px] text-muted-foreground">
              ID: {id}
            </div>
          </div>
        )}

        {/* Branding footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-muted-foreground">
            Powered by <span className="font-bold">Crew Sync</span> • Built by Arpit Bajpai
          </p>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={`text-xs font-bold text-right ${
        highlight ? "text-primary bg-primary/10 px-2 py-0.5 rounded-lg" :
        mono ? "font-mono text-foreground" :
        "text-foreground"
      }`}>
        {value}
      </span>
    </div>
  )
}

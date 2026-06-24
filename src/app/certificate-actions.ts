"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateCertificateNumber, generateVerificationUrl } from "@/lib/certificate-utils"

// ─── Email Helper ───────────────────────────────────────────────────
async function sendResendEmail({
  to,
  subject,
  html,
  attachments
}: {
  to: string
  subject: string
  html: string
  attachments?: any[]
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.startsWith("your-") || apiKey.includes("your_api_key_here")) {
    console.log("-----------------------------------------")
    console.log(`[SIMULATED EMAIL DISPATCH]`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body excerpt: ${html.substring(0, 150)}...`)
    console.log("-----------------------------------------")
    return { success: true, message: "Simulated email sent successfully." }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: "Crew Sync <noreply@crewsync.formstuff.in>",
        to: [to],
        subject,
        html,
        attachments
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err)
    }

    return await response.json()
  } catch (err: any) {
    console.error("Resend delivery failed:", err.message)
    return { error: err.message }
  }
}

// ─── Ticket Email (unchanged) ───────────────────────────────────────
export async function sendTicketEmailAction(email: string, studentName: string, eventTitle: string, ticketCode: string) {
  const subject = `Entry Ticket Confirmed: ${eventTitle}`
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #3b82f6;">Crew Sync</h2>
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Your registration for <strong>${eventTitle}</strong> is successfully confirmed!</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #4b5563;">YOUR ENTRY TICKET CODE:</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">${ticketCode}</p>
      </div>
      <p style="font-size: 14px; color: #6b7280;">You can download your PDF ticket from your Crew Sync student dashboard. Present the QR code at the event entrance for scanning.</p>
      <p>Regards,<br/>Crew Sync Team</p>
    </div>
  `
  return await sendResendEmail({ to: email, subject, html })
}

// ─── Save Certificate Design (V2) ──────────────────────────────────
export async function saveCertificateDesignAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const eventId = formData.get("event_id") as string
  const themeId = formData.get("theme_id") as string || "modern-gold"
  const certTitle = formData.get("cert_title") as string || "Certificate of Completion"
  const certSubtitle = formData.get("cert_subtitle") as string || "PROUDLY PRESENTED TO"
  const description = formData.get("description") as string || "for participation in the campus event"
  const signatoryLeftName = formData.get("signatory_left_name") as string || "Coordinator"
  const signatoryLeftTitle = formData.get("signatory_left_title") as string || "Event Coordinator"
  const signatoryRightName = formData.get("signatory_right_name") as string || "Director"
  const signatoryRightTitle = formData.get("signatory_right_title") as string || "Campus Director"
  const certNumberFormat = formData.get("cert_number_format") as string || "CRS-2026-{{event_id}}-{{user_id}}"
  const autoGenerate = formData.get("auto_generate") === "true"
  const includeQr = formData.get("include_qr") !== "false"
  const status = formData.get("status") as string || "draft"

  const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
  if (!isUuid(eventId)) return { error: "Invalid Event ID." }

  const adminClient = createAdminClient()

  // Check if template already exists for this event
  const { data: existing } = await adminClient
    .from("certificate_templates")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle()

  if (existing) {
    // Update existing template
    const { data, error } = await adminClient
      .from("certificate_templates")
      .update({
        theme_id: themeId,
        cert_title: certTitle,
        cert_subtitle: certSubtitle,
        description,
        signatory_left_name: signatoryLeftName,
        signatory_left_title: signatoryLeftTitle,
        signatory_right_name: signatoryRightName,
        signatory_right_title: signatoryRightTitle,
        cert_number_format: certNumberFormat,
        auto_generate: autoGenerate,
        include_qr: includeQr,
        status,
        template_url: themeId, // Store theme_id as template_url for backward compat
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath("/admin/certificates")
    return { success: "Certificate design updated!", template: data }
  } else {
    // Create new template
    const { data, error } = await adminClient
      .from("certificate_templates")
      .insert({
        event_id: eventId,
        template_url: themeId,
        theme_id: themeId,
        cert_title: certTitle,
        cert_subtitle: certSubtitle,
        description,
        signatory_left_name: signatoryLeftName,
        signatory_left_title: signatoryLeftTitle,
        signatory_right_name: signatoryRightName,
        signatory_right_title: signatoryRightTitle,
        cert_number_format: certNumberFormat,
        auto_generate: autoGenerate,
        include_qr: includeQr,
        status,
      })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath("/admin/certificates")
    return { success: "Certificate design saved!", template: data }
  }
}

// ─── Bulk Generate Certificates ─────────────────────────────────────
export async function bulkGenerateCertificatesAction(
  eventId: string,
  userIds: string[],
  certType: "participation" | "winner" | "runner_up" = "participation"
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const adminClient = createAdminClient()

  // 1. Get template for event
  const { data: template, error: tempErr } = await adminClient
    .from("certificate_templates")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle()

  if (tempErr || !template) {
    return { error: "No certificate design found for this event. Please create one first." }
  }

  // 2. Get event details
  const { data: event } = await adminClient
    .from("events")
    .select("title, event_date")
    .eq("id", eventId)
    .single()

  if (!event) return { error: "Event not found." }

  const certFormat = template.cert_number_format || "CRS-2026-{{event_id}}-{{user_id}}"
  
  let generated = 0
  let skipped = 0
  const errors: string[] = []

  for (const userId of userIds) {
    // Check if certificate already exists
    const { data: existingCert } = await adminClient
      .from("certificates")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .eq("cert_type", certType)
      .maybeSingle()

    if (existingCert) {
      skipped++
      continue
    }

    const certNumber = generateCertificateNumber(certFormat, eventId, userId)

    // Insert certificate
    const { data: cert, error: certErr } = await adminClient
      .from("certificates")
      .insert({
        template_id: template.id,
        user_id: userId,
        event_id: eventId,
        cert_type: certType,
        pdf_url: "#",
        certificate_number: certNumber,
        verification_url: "",
      })
      .select("id")
      .single()

    if (certErr) {
      errors.push(`User ${userId.substring(0, 8)}: ${certErr.message}`)
      continue
    }

    // Update verification URL with the cert ID
    if (cert) {
      const verificationUrl = generateVerificationUrl(cert.id)
      await adminClient
        .from("certificates")
        .update({ verification_url: verificationUrl })
        .eq("id", cert.id)

      // Send email notification
      const { data: profile } = await adminClient
        .from("profiles")
        .select("name, email")
        .eq("id", userId)
        .single()

      if (profile?.email) {
        await sendResendEmail({
          to: profile.email,
          subject: `Certificate Ready: ${event.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #10b981;">Certificate Ready!</h2>
              <p>Hello <strong>${profile.name}</strong>,</p>
              <p>Your certificate of <strong>${certType}</strong> for <strong>${event.title}</strong> is generated and ready!</p>
              <p>Certificate Number: <strong>${certNumber}</strong></p>
              <p>Visit your student dashboard → My Certificates to download it.</p>
              <p>Regards,<br/>Crew Sync Team</p>
            </div>
          `
        })
      }
    }

    generated++
  }

  revalidatePath("/admin/certificates")
  revalidatePath("/student/certificates")

  if (errors.length > 0) {
    return { success: `Generated ${generated} certificates, skipped ${skipped}.`, errors }
  }
  return { success: `Successfully generated ${generated} certificates! (${skipped} already existed)` }
}

// ─── Generate All Certificates for Event ────────────────────────────
export async function generateAllCertificatesAction(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const adminClient = createAdminClient()

  // Get all attended students for this event
  const { data: attendances, error: attErr } = await adminClient
    .from("attendance")
    .select("student_id")
    .eq("event_id", eventId)

  if (attErr || !attendances || attendances.length === 0) {
    return { error: "No attended students found for this event." }
  }

  const userIds = attendances.map((a) => a.student_id)
  return await bulkGenerateCertificatesAction(eventId, userIds, "participation")
}

// ─── Claim Certificate (V2 — updated for new schema) ────────────────
export async function claimCertificateAction(eventId: string, certType: "participation" | "winner" | "runner_up") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Please log in to claim your certificate." }

  // 1. Verify student checked-in for event
  const { data: attendance, error: attErr } = await supabase
    .from("attendance")
    .select("id")
    .eq("event_id", eventId)
    .eq("student_id", user.id)
    .maybeSingle()

  if (attErr || !attendance) {
    return { error: "Certificate locked. Only checked-in participants can claim certificates." }
  }

  // 2. Check if already generated (V2 bulk flow)
  const { data: existingCert } = await supabase
    .from("certificates")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingCert) {
    return { success: "Certificate already available!", cert: existingCert }
  }

  // 3. Fetch template details
  const { data: template, error: tempErr } = await supabase
    .from("certificate_templates")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle()

  if (tempErr || !template) {
    return { error: "Certificate design has not been published by organizers yet." }
  }

  // 4. Generate certificate
  const certFormat = template.cert_number_format || "CRS-2026-{{event_id}}-{{user_id}}"
  const certNumber = generateCertificateNumber(certFormat, eventId, user.id)

  const { data: cert, error: certErr } = await supabase
    .from("certificates")
    .insert({
      template_id: template.id,
      user_id: user.id,
      event_id: eventId,
      cert_type: certType,
      pdf_url: "#",
      certificate_number: certNumber,
      verification_url: "",
    })
    .select()
    .single()

  if (certErr) {
    return { error: "You have already claimed this certificate." }
  }

  // Update verification URL
  if (cert) {
    const verificationUrl = generateVerificationUrl(cert.id)
    await supabase
      .from("certificates")
      .update({ verification_url: verificationUrl })
      .eq("id", cert.id)
    cert.verification_url = verificationUrl
  }

  // Send notification email
  const name = user.user_metadata?.name || "Student"
  const { data: event } = await supabase.from("events").select("title").eq("id", eventId).single()
  const eventTitle = event?.title || "Event"

  await sendResendEmail({
    to: user.email!,
    subject: `Certificate Ready: ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #10b981;">Certificate Ready!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your certificate of <strong>${certType}</strong> for the event <strong>${eventTitle}</strong> is generated and ready to download!</p>
        <p>Certificate Number: <strong>${certNumber}</strong></p>
        <p>Visit your student dashboard → My Certificates to download it.</p>
        <p>Regards,<br/>Crew Sync Team</p>
      </div>
    `
  })

  revalidatePath("/student/certificates")
  return { success: "Certificate successfully claimed!", cert }
}

// ─── Revoke Certificate ─────────────────────────────────────────────
export async function revokeCertificateAction(certId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("certificates")
    .delete()
    .eq("id", certId)

  if (error) return { error: error.message }
  
  revalidatePath("/admin/certificates")
  revalidatePath("/student/certificates")
  return { success: "Certificate revoked." }
}

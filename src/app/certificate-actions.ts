"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 1. Resend Email Dispatch Helper (Simulated logger if API Key missing)
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
        from: "Crew Arena <noreply@crewarena.com>",
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

// Action to send ticket confirmation
export async function sendTicketEmailAction(email: string, studentName: string, eventTitle: string, ticketCode: string) {
  const subject = `Entry Ticket Confirmed: ${eventTitle}`
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #3b82f6;">Crew Arena</h2>
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Your registration for <strong>${eventTitle}</strong> is successfully confirmed!</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #4b5563;">YOUR ENTRY TICKET CODE:</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">${ticketCode}</p>
      </div>
      <p style="font-size: 14px; color: #6b7280;">You can download your PDF ticket from your Crew Arena student dashboard. Present the QR code at the event entrance for scanning.</p>
      <p>Regards,<br/>Crew Arena Team</p>
    </div>
  `
  return await sendResendEmail({ to: email, subject, html })
}

import { uploadImageToCloudinary } from "@/lib/cloudinary"

// Action to create certificate template
export async function createCertificateTemplateAction(formData: FormData) {
  const supabase = await createClient()

  const eventId = formData.get("event_id") as string
  const templateFile = formData.get("template_file") as File
  const titleCoords = JSON.parse(formData.get("title_coords") as string || "{}")
  const nameCoords = JSON.parse(formData.get("name_coords") as string || "{}")
  const dateCoords = JSON.parse(formData.get("date_coords") as string || "{}")

  let templateUrl = "default-gold-border"

  if (templateFile && templateFile.size > 0) {
    try {
      templateUrl = await uploadImageToCloudinary(templateFile, "templates")
    } catch (uploadErr: any) {
      return { error: "Template upload failed: " + uploadErr.message }
    }
  }

  const { data, error } = await supabase
    .from("certificate_templates")
    .insert({
      event_id: eventId,
      template_url: templateUrl,
      title_coords_json: titleCoords,
      name_coords_json: nameCoords,
      date_coords_json: dateCoords
    })
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath("/admin/certificates")
  return { success: "Certificate template saved successfully!", template: data }
}


// Action to verify attendance and claim certificate
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

  // 2. Fetch template details
  const { data: template, error: tempErr } = await supabase
    .from("certificate_templates")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle()

  if (tempErr || !template) {
    return { error: "Certificate templates have not been uploaded by organizers yet." }
  }

  // 3. Create certificate record
  const { data: cert, error: certErr } = await supabase
    .from("certificates")
    .insert({
      template_id: template.id,
      user_id: user.id,
      event_id: eventId,
      cert_type: certType,
      pdf_url: "#" // Generated on the fly on the client side
    })
    .select()
    .single()

  if (certErr) {
    return { error: "You have already claimed this certificate." }
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
        <p>Visit your student dashboard -> My Certificates to download it.</p>
        <p>Regards,<br/>Crew Arena Team</p>
      </div>
    `
  })

  revalidatePath("/student/certificates")
  return { success: "Certificate successfully claimed!", cert }
}

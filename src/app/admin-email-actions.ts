"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { sendResendEmail } from "./certificate-actions"

export async function sendCustomAdminEmailAction(formData: FormData) {
  const supabase = createAdminClient()

  const recipientType = formData.get("recipientType") as string
  const eventId = formData.get("eventId") as string
  const specificEmail = formData.get("specificEmail") as string
  const subject = formData.get("subject") as string
  const body = formData.get("body") as string

  if (!subject || !body) {
    return { error: "Subject and body are required." }
  }

  let emails: string[] = []

  try {
    if (recipientType === "all") {
      const { data, error } = await supabase.from("profiles").select("email")
      if (error) throw error
      emails = data.map((u: any) => u.email).filter(Boolean)
    } else if (recipientType === "event") {
      if (!eventId) return { error: "Event ID is required." }
      
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          profiles!inner(email)
        `)
        .eq("event_id", eventId)
        
      if (error) throw error
      emails = data.map((r: any) => r.profiles?.email).filter(Boolean)
    } else if (recipientType === "specific") {
      if (!specificEmail) return { error: "Specific email is required." }
      emails = [specificEmail]
    } else {
      return { error: "Invalid recipient type." }
    }

    // Deduplicate emails
    emails = [...new Set(emails)]

    if (emails.length === 0) {
      return { error: "No recipients found." }
    }

    let successCount = 0
    let failCount = 0

    for (const email of emails) {
      try {
        const result = await sendResendEmail({
          to: email,
          subject,
          html: body
        })
        if (result.error) {
          failCount++
        } else {
          successCount++
        }
      } catch (e) {
        failCount++
      }
    }

    if (failCount > 0 && successCount === 0) {
      return { error: `Failed to send all ${failCount} emails.` }
    }

    return { 
      success: `Successfully sent ${successCount} emails.` + (failCount > 0 ? ` (${failCount} failed)` : '') 
    }
  } catch (err: any) {
    console.error("Failed to send custom emails:", err)
    return { error: err.message || "An unexpected error occurred." }
  }
}

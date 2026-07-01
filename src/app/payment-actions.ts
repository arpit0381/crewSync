"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { broadcastNotificationAction } from "./notification-actions"
import { generateTicketPDFBase64 } from "@/lib/server-ticket-pdf"
import { sendTicketEmailAction } from "./certificate-actions"

export async function verifyPaymentAction(registrationId: string) {
  const supabase = createAdminClient()

  // 1. Fetch the registration
  const { data: reg, error: regErr } = await supabase
    .from("registrations")
    .select("*, events(title), profiles(name)")
    .eq("id", registrationId)
    .single()

  if (regErr || !reg) {
    return { error: "Registration not found." }
  }

  if (reg.payment_status === "verified") {
    return { error: "Payment is already verified." }
  }

  // 2. Determine which registrations to update (if team captain, update all members)
  let registrationsToUpdate = [reg.id]
  let userIdsToNotify = [reg.user_id]

  if (reg.team_id) {
    // Check if this user is the captain
    const { data: team } = await supabase
      .from("teams")
      .select("captain_id")
      .eq("id", reg.team_id)
      .single()

    if (team && team.captain_id === reg.user_id) {
      // Fetch all registrations for this team
      const { data: teamRegs } = await supabase
        .from("registrations")
        .select("id, user_id")
        .eq("team_id", reg.team_id)
      
      if (teamRegs) {
        registrationsToUpdate = teamRegs.map(r => r.id)
        userIdsToNotify = teamRegs.map(r => r.user_id)
      }
    }
  }

  // 3. Update all relevant registrations
  const { error: updateErr } = await supabase
    .from("registrations")
    .update({ payment_status: "verified" })
    .in("id", registrationsToUpdate)

  if (updateErr) {
    return { error: "Failed to update payment status." }
  }

  // 4. Generate tickets for all verified registrations
  const ticketsToInsert = registrationsToUpdate.map(id => ({
    ticket_code: `CRS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    registration_id: id
  }))

  // We should ignore conflicts if they somehow already have a ticket
  for (const t of ticketsToInsert) {
    await supabase.from("tickets").insert(t)
  }

  // 5. Send notifications
  for (const userId of userIdsToNotify) {
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Payment Verified",
      message: `Your payment for ${reg.events?.title} has been verified and your ticket is ready!`,
      type: "system"
    })
  }

  // 6. Generate and send PDF tickets via email
  const { data: updatedRegs } = await supabase
    .from("registrations")
    .select(`
      id,
      user_id,
      profiles (
        name,
        email,
        roll_number
      ),
      events:event_id (
        title,
        event_date,
        event_time,
        venue,
        categories (
          name
        )
      ),
      tickets (
        ticket_code
      )
    `)
    .in("id", registrationsToUpdate)

  if (updatedRegs) {
    for (const r of updatedRegs) {
      const profile = r.profiles as any
      const event = r.events as any
      const ticketsArray = r.tickets as any
      const ticketData = Array.isArray(ticketsArray) ? ticketsArray[0] : ticketsArray
      const ticketCode = ticketData?.ticket_code

      if (profile?.email && event && ticketCode) {
        try {
          const pdfBase64 = await generateTicketPDFBase64({
            ticketCode,
            userName: profile.name || "Student",
            userRoll: profile.roll_number || "N/A",
            userEmail: profile.email,
            eventTitle: event.title,
            eventDate: event.event_date,
            eventTime: event.event_time,
            venue: event.venue,
            categoryName: event.categories?.name || "General"
          })

          await sendTicketEmailAction(
            profile.email,
            profile.name || "Student",
            event.title,
            ticketCode,
            pdfBase64
          )
        } catch (err: any) {
          console.error(`Failed to generate/send ticket email for registration ${r.id}:`, err)
        }
      }
    }
  }

  revalidatePath("/admin/payments")
  revalidatePath("/student/registrations")
  
  return { success: "Payment verified and tickets generated!" }
}

export async function rejectPaymentAction(registrationId: string) {
  const supabase = createAdminClient()

  // 1. Fetch the registration
  const { data: reg, error: regErr } = await supabase
    .from("registrations")
    .select("*, events(title)")
    .eq("id", registrationId)
    .single()

  if (regErr || !reg) {
    return { error: "Registration not found." }
  }

  // 2. Update status to rejected
  const { error: updateErr } = await supabase
    .from("registrations")
    .update({ payment_status: "rejected" })
    .eq("id", registrationId)

  if (updateErr) {
    return { error: "Failed to reject payment." }
  }

  // 3. Send notification
  await supabase.from("notifications").insert({
    user_id: reg.user_id,
    title: "Payment Rejected",
    message: `Your payment for ${reg.events?.title} could not be verified. Please check your transaction details and contact administration.`,
    type: "system"
  })

  revalidatePath("/admin/payments")
  revalidatePath("/student/registrations")
  
  return { success: "Payment rejected." }
}

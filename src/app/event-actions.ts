"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { uploadImageToCloudinary, uploadBase64ToCloudinary } from "@/lib/cloudinary"
import { broadcastNotificationAction } from "./notification-actions"

export async function createEventAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const categoryId = formData.get("category_id") as string
  const venue = formData.get("venue") as string
  const date = formData.get("event_date") as string
  const time = formData.get("event_time") as string
  const capacity = parseInt(formData.get("capacity") as string) || 100
  const regType = formData.get("reg_type") as "individual" | "team"
  const minTeamSize = parseInt(formData.get("min_team_size") as string) || 1
  const maxTeamSize = parseInt(formData.get("max_team_size") as string) || 1
  const departmentId = formData.get("department_id") as string || null
  const clubId = formData.get("club_id") as string || null
  const status = (formData.get("status") as any) || "draft"
  
  const isPaid = formData.get("is_paid") === "on" || formData.get("is_paid") === "true"
  const feeAmount = parseFloat(formData.get("fee_amount") as string) || 0
  const paymentRemarks = formData.get("payment_remarks") as string || null

  if (!title || !description || !categoryId || !venue || !date || !time) {
    return { error: "All required fields must be filled" }
  }

  const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  let finalCategoryId = categoryId
  let finalDepartmentId = departmentId
  let finalClubId = clubId

  if (!isUuid(categoryId)) {
    return { error: "Invalid Category ID." }
  }

  if (departmentId && !isUuid(departmentId)) {
    return { error: "Invalid Department ID." }
  }

  if (clubId && !isUuid(clubId)) {
    return { error: "Invalid Club ID." }
  }

  const bannerUrlOverride = formData.get("banner_url_override") as string
  let bannerUrl = bannerUrlOverride || null

  const paymentQrUrlOverride = formData.get("payment_qr_url_override") as string
  let paymentQrUrl = paymentQrUrlOverride || null

  const adminClient = createAdminClient()

  // Insert event
  const { data: event, error } = await adminClient
    .from("events")
    .insert({
      title,
      description,
      category_id: finalCategoryId,
      venue,
      event_date: date,
      event_time: time,
      capacity,
      reg_type: regType,
      min_team_size: regType === "team" ? minTeamSize : 1,
      max_team_size: regType === "team" ? maxTeamSize : 1,
      department_id: finalDepartmentId,
      club_id: finalClubId,
      status,
      is_paid: isPaid,
      fee_amount: feeAmount,
      payment_qr_url: paymentQrUrl,
      payment_remarks: paymentRemarks,
      created_by: user.id,
      banner_url: bannerUrl
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Trigger notification if published directly
  if (status === "published") {
    await broadcastNotificationAction(
      `New Event: ${title}`,
      `A new event "${title}" has been published! Check it out and register now.`,
      "event"
    )
  }

  revalidatePath("/admin/events")
  revalidatePath("/")
  return { success: "Event created successfully", event }
}

export async function updateEventAction(eventId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const categoryId = formData.get("category_id") as string
  const venue = formData.get("venue") as string
  const date = formData.get("event_date") as string
  const time = formData.get("event_time") as string
  const capacity = parseInt(formData.get("capacity") as string) || 100
  const regType = formData.get("reg_type") as "individual" | "team"
  const minTeamSize = parseInt(formData.get("min_team_size") as string) || 1
  const maxTeamSize = parseInt(formData.get("max_team_size") as string) || 1
  const departmentId = formData.get("department_id") as string || null
  const clubId = formData.get("club_id") as string || null
  const status = (formData.get("status") as any) || "draft"

  const isPaid = formData.get("is_paid") === "on" || formData.get("is_paid") === "true"
  const feeAmount = parseFloat(formData.get("fee_amount") as string) || 0
  const paymentRemarks = formData.get("payment_remarks") as string || null

  if (!title || !description || !categoryId || !venue || !date || !time) {
    return { error: "All required fields must be filled" }
  }

  const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  if (!isUuid(categoryId)) return { error: "Invalid Category ID." }
  if (departmentId && !isUuid(departmentId)) return { error: "Invalid Department ID." }
  if (clubId && !isUuid(clubId)) return { error: "Invalid Club ID." }

  const bannerUrlOverride = formData.get("banner_url_override") as string
  let bannerUrl = bannerUrlOverride || null

  const paymentQrUrlOverride = formData.get("payment_qr_url_override") as string
  let paymentQrUrl = paymentQrUrlOverride || null

  const adminClient = createAdminClient()

  // Prepare update payload
  const payload: any = {
    title,
    description,
    category_id: categoryId,
    venue,
    event_date: date,
    event_time: time,
    capacity,
    reg_type: regType,
    min_team_size: regType === "team" ? minTeamSize : 1,
    max_team_size: regType === "team" ? maxTeamSize : 1,
    department_id: departmentId,
    club_id: clubId,
    status,
    is_paid: isPaid,
    fee_amount: feeAmount,
    payment_remarks: paymentRemarks,
    updated_at: new Date().toISOString()
  }

  // Only update banner if a new one was provided
  if (bannerUrl) {
    payload.banner_url = bannerUrl
  }
  
  if (paymentQrUrl) {
    payload.payment_qr_url = paymentQrUrl
  }

  const { data: event, error } = await adminClient
    .from("events")
    .update(payload)
    .eq("id", eventId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // We can't easily know if the status CHANGED to published without checking previous state,
  // but for simplicity, we will trigger it if it's published. Ideally we only trigger if previous wasn't published.
  // We'll skip broadcast on update to avoid spam, unless it's done specifically via updateEventStatusAction.
  
  revalidatePath("/admin/events")
  revalidatePath("/")
  return { success: "Event updated successfully", event }
}

export async function updateEventStatusAction(
  eventId: string,
  status: "draft" | "pending_approval" | "published" | "completed"
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("events")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", eventId)

  if (error) {
    return { error: error.message }
  }

  if (status === "published") {
    // Fetch event title for notification
    const adminClient = createAdminClient()
    const { data: eventData } = await adminClient.from("events").select("title").eq("id", eventId).single()
    if (eventData) {
      await broadcastNotificationAction(
        `New Event: ${eventData.title}`,
        `A new event "${eventData.title}" has been published! Check it out and register now.`,
        "event"
      )
    }
  }

  revalidatePath("/admin/events")
  revalidatePath("/")
  return { success: `Event status updated to ${status.replace("_", " ")}` }
}

export async function deleteEventAction(eventId: string) {
  const adminClient = createAdminClient()
  
  // We use the admin client to bypass RLS policies if needed, 
  // or we could check user permissions here.
  const { error } = await adminClient
    .from("events")
    .delete()
    .eq("id", eventId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/events")
  revalidatePath("/")
  return { success: "Event deleted successfully" }
}

export async function registerForEventAction(
  eventId: string,
  regType: "individual" | "team",
  teamDetails?: { mode: "create" | "join"; teamName?: string; inviteCode?: string },
  paymentDetails?: { screenshotBase64?: string; transactionId?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be signed in to register." }

  let finalEventId = eventId

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
    return { error: "Invalid Event ID." }
  }

  // 1. Fetch event config and current registrations count
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .eq("id", finalEventId)
    .single()

  if (eventErr || !event) {
    return { error: "Event not found." }
  }

  if (event.status !== "published") {
    return { error: "This event is not accepting registrations." }
  }

  let paymentScreenshotUrl = null
  if (event.is_paid && paymentDetails?.screenshotBase64) {
    try {
      paymentScreenshotUrl = await uploadBase64ToCloudinary(paymentDetails.screenshotBase64, "payments")
    } catch (e) {
      return { error: "Error uploading payment screenshot." }
    }
  }

  const adminSupabase = createAdminClient()

  // Check capacity (bypassing RLS)
  const { count: currentRegs } = await adminSupabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", finalEventId)

  if (currentRegs !== null && currentRegs >= event.capacity) {
    return { error: "Registration full! Capacity limit reached." }
  }

  // Check duplicate registration
  const { data: existingReg } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", finalEventId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingReg) {
    return { error: "You are already registered for this event." }
  }

  // 2. Individual Registration logic
  if (regType === "individual") {
    // Insert registration
    const paymentStatus = event.is_paid ? "pending_verification" : "free"
    
    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .insert({
        event_id: finalEventId,
        user_id: user.id,
        payment_status: paymentStatus,
        payment_screenshot_url: paymentScreenshotUrl,
        transaction_id: paymentDetails?.transactionId || null
      })
      .select()
      .single()

    if (regErr) return { error: regErr.message }

    // Auto-generate a ticket for the user IF payment is not pending
    if (paymentStatus === "free") {
      const ticketCode = `CRS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      const adminSupabase = createAdminClient()
      await adminSupabase.from("tickets").insert({
        ticket_code: ticketCode,
        registration_id: reg.id
      })
    }

    revalidatePath("/student")
    revalidatePath("/")
    
    if (paymentStatus === "pending_verification") {
      return { success: "Registration submitted! We will verify your payment and generate your ticket soon.", paymentStatus }
    }
    
    return { success: "Registered successfully! Ticket generated.", paymentStatus }
  }

  // 3. Team Registration logic
  if (regType === "team" && teamDetails) {
    // Mode A: Create a new team
    if (teamDetails.mode === "create") {
      if (!teamDetails.teamName) return { error: "Team name is required." }

      // Generate a random 6-character unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Create team
      const { data: team, error: teamErr } = await supabase
        .from("teams")
        .insert({
          name: teamDetails.teamName,
          event_id: finalEventId,
          captain_id: user.id,
          invite_code: inviteCode,
          min_members: event.min_team_size,
          max_members: event.max_team_size
        })
        .select()
        .single()

      if (teamErr) return { error: teamErr.message }

      // Add captain to team_members
      await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user.id
      })

      // Register the captain
      const paymentStatus = event.is_paid ? "pending_verification" : "free"
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .insert({
          event_id: finalEventId,
          user_id: user.id,
          team_id: team.id,
          payment_status: paymentStatus,
          payment_screenshot_url: paymentScreenshotUrl,
          transaction_id: paymentDetails?.transactionId || null
        })
        .select()
        .single()

      if (regErr) return { error: regErr.message }

      // Auto-generate ticket if free
      if (paymentStatus === "free") {
        const ticketCode = `CRS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
        const adminSupabase = createAdminClient()
        await adminSupabase.from("tickets").insert({
          ticket_code: ticketCode,
          registration_id: reg.id
        })
      }

      revalidatePath("/student")
      
      if (paymentStatus === "pending_verification") {
        return { success: `Team created successfully! Invite code: ${inviteCode}. Payment is pending verification.`, inviteCode, paymentStatus }
      }
      
      return { success: `Team created successfully! Invite code: ${inviteCode}`, inviteCode, paymentStatus }
    }

    // Mode B: Join an existing team
    if (teamDetails.mode === "join") {
      if (!teamDetails.inviteCode) return { error: "Invite code is required." }

      // Find the team
      const { data: team, error: teamFindErr } = await supabase
        .from("teams")
        .select("id, max_members, captain_id")
        .eq("invite_code", teamDetails.inviteCode)
        .eq("event_id", finalEventId)
        .single()

      if (teamFindErr || !team) {
        return { error: "Invalid invite code for this event." }
      }

      // Check current member size of the team
      const { count: memberCount } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", team.id)

      const maxLimit = (team as any).max_members || event.max_team_size

      if (memberCount !== null && memberCount >= maxLimit) {
        return { error: "Team is already full! Cannot join." }
      }

      // Join team_members
      const { error: joinErr } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id
        })

      if (joinErr) return { error: "You are already a member of this team." }

      // Create registration
      // If joining a team, the captain's payment status dictates the team's status, but since captain has to pay full amount,
      // the new member inherits the "pending" or "verified" state. We can query the captain's registration or just set it based on the event.
      // Easiest is to see if the team is already verified.
      const { data: captainReg } = await adminSupabase
        .from("registrations")
        .select("payment_status")
        .eq("team_id", team.id)
        .eq("user_id", team.captain_id)
        .maybeSingle()
        
      const inheritedPaymentStatus = captainReg?.payment_status || (event.is_paid ? "pending_verification" : "free")

      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .insert({
          event_id: finalEventId,
          user_id: user.id,
          team_id: team.id,
          payment_status: inheritedPaymentStatus
        })
        .select()
        .single()

      if (regErr) return { error: regErr.message }

      // Auto-generate ticket if the team is verified/free
      if (inheritedPaymentStatus === "free" || inheritedPaymentStatus === "verified") {
        const ticketCode = `CRS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
        const adminSupabase = createAdminClient()
        await adminSupabase.from("tickets").insert({
          ticket_code: ticketCode,
          registration_id: reg.id
        })
      }

      revalidatePath("/student")
      
      if (inheritedPaymentStatus === "pending_verification") {
         return { success: "Joined team successfully! Waiting for Captain's payment verification to receive your ticket.", paymentStatus: inheritedPaymentStatus }
      }
      
      return { success: "Joined team and registered successfully!", paymentStatus: inheritedPaymentStatus }
    }
  }

  return { error: "Invalid registration parameters." }
}

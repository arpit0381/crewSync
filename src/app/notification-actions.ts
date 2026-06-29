"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getNotificationsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notifications: [] }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching notifications:", error)
    return { notifications: [] }
  }

  return { notifications: data }
}

export async function markNotificationAsReadAction(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function markAllNotificationsAsReadAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null)

  if (error) return { error: error.message }
  
  revalidatePath("/", "layout")
  return { success: true }
}

export async function broadcastNotificationAction(title: string, message: string, type: string = "system") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: "Unauthorized" }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const allowedRoles = ["super_admin", "department_admin", "club_admin", "tournament_admin"]
  if (!profile || !allowedRoles.includes(profile.role)) return { error: "Unauthorized: Admins only" }

  const adminClient = createAdminClient()
  
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("id")

  if (profilesError || !profiles) {
    return { error: "Failed to fetch users for broadcast." }
  }

  const notifications = profiles.map(p => ({
    user_id: p.id,
    title,
    message,
    type
  }))

  if (notifications.length === 0) return { success: true, count: 0 }

  const chunkSize = 1000
  let inserted = 0
  
  for (let i = 0; i < notifications.length; i += chunkSize) {
    const chunk = notifications.slice(i, i + chunkSize)
    const { error: insertError } = await adminClient
      .from("notifications")
      .insert(chunk)
      
    if (insertError) {
      console.error("Error broadcasting chunk:", insertError)
      return { error: "Failed to send all notifications." }
    }
    inserted += chunk.length
  }

  return { success: true, count: inserted }
}

export async function deleteNotificationsAction(notificationIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)
    .in("id", notificationIds)

  if (error) return { error: error.message }
  return { success: true }
}

export async function requestEventFeedbackAction(eventId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Check admin role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const allowedRoles = ["super_admin", "department_admin", "club_admin", "tournament_admin"]
    if (!profile || !allowedRoles.includes(profile.role)) {
      return { error: "Unauthorized: Admins only" }
    }

    // Get event title
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single()

    if (eventError || !event) {
      return { error: "Event not found." }
    }

    // Query all participants who are registered
    const { data: regs, error: regsError } = await supabase
      .from("registrations")
      .select("user_id")
      .eq("event_id", eventId)

    if (regsError || !regs) {
      return { error: "Failed to fetch event participants." }
    }

    const uniqueUserIds = Array.from(new Set(regs.map(r => r.user_id).filter(Boolean)))

    if (uniqueUserIds.length === 0) {
      return { error: "No registered participants found for this event." }
    }

    const adminClient = createAdminClient()
    
    // Create feedback notifications
    const feedbackNotifications = uniqueUserIds.map(uid => ({
      user_id: uid,
      title: `Share Feedback: ${event.title}`,
      message: `We hope you enjoyed the event! Please share your valuable experience and rate your experience for "${event.title}".`,
      type: "feedback",
      event_id: eventId
    }))

    // Batch insert notifications using admin client
    const chunkSize = 1000
    let inserted = 0

    for (let i = 0; i < feedbackNotifications.length; i += chunkSize) {
      const chunk = feedbackNotifications.slice(i, i + chunkSize)
      const { error: insertError } = await adminClient
        .from("notifications")
        .insert(chunk)

      if (insertError) {
        console.error("Error creating feedback notifications:", insertError)
        return { error: "Failed to distribute all feedback requests." }
      }
      inserted += chunk.length
    }

    return { success: true, count: inserted }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
}

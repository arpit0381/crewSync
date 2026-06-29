"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Submit feedback from student
export async function submitFeedbackAction(eventId: string, rating: number, feedbackText: string, notificationId?: string) {
  try {
    if (rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5 stars." }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Insert feedback
    const { error: insertError } = await supabase
      .from("event_feedback")
      .insert({
        event_id: eventId,
        user_id: user.id,
        rating,
        feedback_text: feedbackText
      })

    if (insertError) {
      // Check for unique constraint violation (code 23505)
      if (insertError.code === "23505") {
        return { error: "You have already submitted feedback for this event." }
      }
      return { error: insertError.message }
    }

    // Mark notification as read if notificationId is provided
    if (notificationId) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", user.id)
    }

    revalidatePath("/student/notifications")
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
}

// Fetch feedback stats for admin
export async function getFeedbackStatsAction(eventId: string) {
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

    // Fetch feedbacks with profile details
    const { data: feedbacks, error } = await supabase
      .from("event_feedback")
      .select(`
        id,
        rating,
        feedback_text,
        created_at,
        profiles (
          name,
          roll_number,
          departments (name)
        )
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })

    if (error) {
      return { error: error.message }
    }

    // Calculate analytics
    const count = feedbacks.length
    const averageRating = count > 0 
      ? parseFloat((feedbacks.reduce((sum, f) => sum + f.rating, 0) / count).toFixed(1))
      : 0

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    feedbacks.forEach(f => {
      const r = f.rating as 1 | 2 | 3 | 4 | 5
      if (distribution[r] !== undefined) {
        distribution[r] += 1
      }
    })

    return {
      success: true,
      stats: {
        count,
        averageRating,
        distribution,
        feedbacks: feedbacks.map(f => {
          const profile = f.profiles as any
          let deptName = "N/A"
          if (profile?.departments) {
            deptName = Array.isArray(profile.departments) 
              ? profile.departments[0]?.name 
              : profile.departments?.name
          }
          return {
            id: f.id,
            rating: f.rating,
            text: f.feedback_text,
            createdAt: f.created_at,
            studentName: profile?.name || "Student",
            studentRoll: profile?.roll_number || "N/A",
            studentDept: deptName || "N/A"
          }
        })
      }
    }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
}

export async function getEventDetailsAction(eventId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single()

    if (error) return { error: error.message }
    return { success: true, title: data.title }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
}

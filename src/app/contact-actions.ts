"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ContactSubmissionInput {
  name: string
  email: string
  subject: string
  message: string
  category: string
  vibe: string
}

// 1. Submit a Contact Inquiry
export async function submitContactAction(input: ContactSubmissionInput) {
  try {
    const { name, email, subject, message, category, vibe } = input

    if (!name || !email || !subject || !message || !category || !vibe) {
      return { error: "All fields are required." }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address." }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Insert contact submission
    const { error } = await supabase
      .from("contact_submissions")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        category,
        vibe,
        user_id: user?.id || null,
        status: "unread"
      })

    if (error) {
      console.error("Error submitting contact inquiry:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("Unexpected error in submitContactAction:", err)
    return { error: err.message || "An unexpected error occurred." }
  }
}

// 2. Fetch Contact Submissions for Admins
export async function getContactSubmissionsAction(filters?: {
  status?: string
  category?: string
  search?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Check admin role
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileErr || !profile) {
      return { error: "Could not fetch user profile details." }
    }

    const allowedRoles = ["super_admin", "department_admin", "club_admin", "tournament_admin"]
    if (!allowedRoles.includes(profile.role)) {
      return { error: "Unauthorized: Administrator access required." }
    }

    let query = supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    // Apply Status filter
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    // Apply Category filter
    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
    }

    const { data: submissions, error } = await query

    if (error) {
      console.error("Error fetching submissions:", error)
      return { error: error.message }
    }

    // Client-side text search (fuzzy match on Name, Email, Subject, Message)
    let filteredSubmissions = submissions || []
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredSubmissions = filteredSubmissions.filter(sub => 
        sub.name.toLowerCase().includes(searchLower) ||
        sub.email.toLowerCase().includes(searchLower) ||
        sub.subject.toLowerCase().includes(searchLower) ||
        sub.message.toLowerCase().includes(searchLower)
      )
    }

    return { success: true, submissions: filteredSubmissions }
  } catch (err: any) {
    console.error("Unexpected error in getContactSubmissionsAction:", err)
    return { error: err.message || "An unexpected error occurred." }
  }
}

// 3. Update Status and Admin Notes
export async function updateContactStatusAction(
  id: string,
  status: "unread" | "read" | "resolved",
  adminNotes: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const allowedRoles = ["super_admin", "department_admin", "club_admin", "tournament_admin"]
    if (!profile || !allowedRoles.includes(profile.role)) {
      return { error: "Unauthorized: Administrator access required." }
    }

    const { error } = await supabase
      .from("contact_submissions")
      .update({
        status,
        admin_notes: adminNotes
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating submission status:", error)
      return { error: error.message }
    }

    revalidatePath("/admin/contacts")
    return { success: true }
  } catch (err: any) {
    console.error("Unexpected error in updateContactStatusAction:", err)
    return { error: err.message || "An unexpected error occurred." }
  }
}

// 4. Delete a Contact Submission
export async function deleteContactSubmissionAction(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const allowedRoles = ["super_admin", "department_admin", "club_admin", "tournament_admin"]
    if (!profile || !allowedRoles.includes(profile.role)) {
      return { error: "Unauthorized: Administrator access required." }
    }

    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting submission:", error)
      return { error: error.message }
    }

    revalidatePath("/admin/contacts")
    return { success: true }
  } catch (err: any) {
    console.error("Unexpected error in deleteContactSubmissionAction:", err)
    return { error: err.message || "An unexpected error occurred." }
  }
}

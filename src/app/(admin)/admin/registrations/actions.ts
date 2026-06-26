"use server"

import { createAdminClient } from "@/lib/supabase/server"

export async function getRegistrationsByEventAction(eventId: string) {
  const supabase = createAdminClient()
  
  let query = supabase
    .from("registrations")
    .select(`
      id,
      created_at,
      user_id,
      events (
        title,
        reg_type
      ),
      profiles (
        name,
        roll_number,
        mobile,
        email,
        section,
        departments (name)
      ),
      teams (
        id,
        name,
        captain_id
      )
    `)
    .order("created_at", { ascending: false })

  if (eventId !== "all") {
    query = query.eq("event_id", eventId)
  }

  const { data: registrations, error } = await query

  if (error) {
    console.error("Failed to fetch registrations", error)
    return { error: error.message }
  }

  const formattedRegs = (registrations || []).map((r: any) => ({
    id: r.id,
    created_at: r.created_at,
    event_title: r.events?.title || "Campus Event",
    reg_type: r.events?.reg_type || "individual",
    student_name: r.profiles?.name || "Student",
    roll_number: r.profiles?.roll_number || "N/A",
    phone: r.profiles?.mobile || "N/A",
    email: r.profiles?.email || "N/A",
    department: r.profiles?.departments?.name || "N/A",
    section: r.profiles?.section || "N/A",
    team_name: r.teams?.name || null,
    team_id: r.teams?.id || null,
    is_captain: r.teams ? r.teams.captain_id === r.user_id : false
  }))

  return { data: formattedRegs }
}

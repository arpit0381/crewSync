"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function verifyAndCheckInAction(ticketCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized. Please sign in as organizer." }

  // 1. Fetch ticket and registration info
  const { data: ticket, error: ticketErr } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_code,
      registration_id,
      registrations (
        id,
        event_id,
        user_id,
        profiles (
          name,
          roll_number,
          email
        ),
        events (
          title,
          event_date,
          venue
        )
      )
    `)
    .eq("ticket_code", ticketCode)
    .maybeSingle()

  if (ticketErr || !ticket) {
    return { error: `Ticket "${ticketCode}" not found in system.` }
  }

  const registration = ticket.registrations as any
  if (!registration) {
    return { error: "Ticket is not linked to any registration." }
  }

  const student = registration.profiles
  const event = registration.events

  // 2. Check if student has already checked in for this event
  const { data: existingAttendance } = await supabase
    .from("attendance")
    .select("id, checked_in_at, checked_in_by(name)")
    .eq("ticket_id", ticket.id)
    .maybeSingle()

  if (existingAttendance) {
    const checker = (existingAttendance.checked_in_by as any)?.name || "Organizer"
    return {
      warning: "Duplicate Scan!",
      studentName: student.name,
      rollNumber: student.roll_number,
      eventTitle: event.title,
      checkedInAt: new Date(existingAttendance.checked_in_at).toLocaleTimeString(),
      checkedInBy: checker
    }
  }

  // 3. Mark attendance
  const { error: checkinErr } = await supabase
    .from("attendance")
    .insert({
      ticket_id: ticket.id,
      event_id: registration.event_id,
      student_id: registration.user_id,
      checked_in_by: user.id
    })

  if (checkinErr) {
    return { error: "Failed to save attendance record: " + checkinErr.message }
  }

  revalidatePath("/admin/attendance")
  revalidatePath("/admin")
  return {
    success: "Check-in Successful!",
    studentName: student.name,
    rollNumber: student.roll_number,
    eventTitle: event.title
  }
}

// Fetch list of checked-in participants for an event
export async function getEventAttendanceAction(eventId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("attendance")
    .select(`
      id,
      checked_in_at,
      profiles (
        name,
        roll_number,
        email,
        departments (name)
      )
    `)
    .eq("event_id", eventId)
    .order("checked_in_at", { ascending: false })

  if (error) return { error: error.message }
  return { attendance: data }
}

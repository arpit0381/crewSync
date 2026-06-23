import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AttendanceClient } from "./attendance-client"

export default async function EventAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }
  const role = user.user_metadata?.role
  if (!["super_admin", "department_admin", "club_admin", "tournament_admin"].includes(role)) {
    redirect("/student")
  }

  const { id: eventId } = await params

  // Fetch Event Details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(`
      id,
      title,
      reg_type,
      event_date,
      event_time,
      status
    `)
    .eq("id", eventId)
    .single()

  if (eventError || !event) {
    return <div className="p-8 text-red-500">Event not found or access denied.</div>
  }

  // Fetch Attendance Data
  const { data: attendanceData } = await supabase
    .from("attendance")
    .select(`
      student_id,
      checked_in_at,
      checked_in_by,
      checker:profiles!checked_in_by(name)
    `)
    .eq("event_id", eventId)

  const attendanceMap = new Map()
  if (attendanceData) {
    attendanceData.forEach((record) => {
      attendanceMap.set(record.student_id, {
        checked_in_at: record.checked_in_at,
        checked_in_by_name: (record.checker as any)?.name || "Unknown Admin"
      })
    })
  }

  // Fetch Participants
  const participants: any[] = []

  if (event.reg_type === "individual") {
    // Fetch all individual registrations
    const { data: registrations } = await supabase
      .from("registrations")
      .select(`
        user_id,
        profiles (
          id, name, roll_number, email, section,
          departments (name)
        )
      `)
      .eq("event_id", eventId)

    if (registrations) {
      registrations.forEach((reg: any) => {
        if (!reg.profiles) return
        const att = attendanceMap.get(reg.user_id)
        participants.push({
          user_id: reg.user_id,
          name: reg.profiles.name,
          roll_number: reg.profiles.roll_number,
          email: reg.profiles.email,
          section: reg.profiles.section,
          department_name: reg.profiles.departments?.name,
          team_name: null,
          status: att ? "Present" : "Absent",
          checked_in_at: att?.checked_in_at,
          checked_in_by_name: att?.checked_in_by_name
        })
      })
    }
  } else {
    // Fetch all team members for this event
    const { data: teams } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        team_members (
          user_id,
          profiles (
            id, name, roll_number, email, section,
            departments (name)
          )
        )
      `)
      .eq("event_id", eventId)

    if (teams) {
      teams.forEach((team: any) => {
        if (!team.team_members) return
        team.team_members.forEach((member: any) => {
          if (!member.profiles) return
          const att = attendanceMap.get(member.user_id)
          participants.push({
            user_id: member.user_id,
            name: member.profiles.name,
            roll_number: member.profiles.roll_number,
            email: member.profiles.email,
            section: member.profiles.section,
            department_name: member.profiles.departments?.name,
            team_name: team.name,
            status: att ? "Present" : "Absent",
            checked_in_at: att?.checked_in_at,
            checked_in_by_name: att?.checked_in_by_name
          })
        })
      })
    }
  }

  // Calculate totals
  const totalRegistered = participants.length
  const totalPresent = attendanceMap.size // people who actually showed up
  const totalAbsent = totalRegistered - totalPresent

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <AttendanceClient 
        event={event} 
        participants={participants} 
        stats={{ totalRegistered, totalPresent, totalAbsent }}
      />
    </div>
  )
}

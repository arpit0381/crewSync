"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { uploadImageToCloudinary } from "@/lib/cloudinary"

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

  if (!title || !description || !categoryId || !venue || !date || !time) {
    return { error: "All required fields must be filled" }
  }

  const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  let finalCategoryId = categoryId
  let finalDepartmentId = departmentId
  let finalClubId = clubId

  // 1. Resolve Category
  if (!isUuid(categoryId)) {
    const mockCategories: { [key: string]: { name: string; type: string } } = {
      "cat-1": { name: "Workshop", type: "academic" },
      "cat-2": { name: "Hackathon", type: "technical" },
      "cat-3": { name: "Guest Lecture", type: "academic" },
      "cat-4": { name: "Cricket", type: "sports" },
      "cat-5": { name: "Valorant", type: "esports" }
    }
    const mock = mockCategories[categoryId] || { name: "General", type: "technical" }
    const { data: existing } = await supabase.from("categories").select("id").eq("name", mock.name).maybeSingle()
    if (existing) {
      finalCategoryId = existing.id
    } else {
      const adminSupabase = createAdminClient()
      const { data: inserted, error: insErr } = await adminSupabase
        .from("categories")
        .insert({ name: mock.name, type: mock.type })
        .select("id")
        .single()
      if (insErr || !inserted) {
        return { error: "Failed to seed category: " + (insErr?.message || "") }
      }
      finalCategoryId = inserted.id
    }
  }

  // 2. Resolve Department
  if (departmentId && !isUuid(departmentId)) {
    const mockDepts: { [key: string]: { name: string; code: string } } = {
      "dept-1": { name: "Bachelor of Computer Applications", code: "BCA" },
      "dept-2": { name: "Master of Computer Applications", code: "MCA" },
      "dept-3": { name: "Bachelor of Business Administration", code: "BBA" }
    }
    const mock = mockDepts[departmentId]
    if (mock) {
      const { data: existing } = await supabase.from("departments").select("id").eq("code", mock.code).maybeSingle()
      if (existing) {
        finalDepartmentId = existing.id
      } else {
        const adminSupabase = createAdminClient()
        const { data: inserted, error: insErr } = await adminSupabase
          .from("departments")
          .insert({ name: mock.name, code: mock.code })
          .select("id")
          .single()
        if (insErr || !inserted) {
          return { error: "Failed to seed department: " + (insErr?.message || "") }
        }
        finalDepartmentId = inserted.id
      }
    } else {
      finalDepartmentId = null
    }
  }

  // 3. Resolve Club
  if (clubId && !isUuid(clubId)) {
    const mockClubs: { [key: string]: string } = {
      "club-1": "Logix Coding Club",
      "club-2": "Energy Sports Club",
      "club-3": "Cultural Arts Club"
    }
    const mockName = mockClubs[clubId]
    if (mockName) {
      const { data: existing } = await supabase.from("clubs").select("id").eq("name", mockName).maybeSingle()
      if (existing) {
        finalClubId = existing.id
      } else {
        const adminSupabase = createAdminClient()
        const { data: inserted, error: insErr } = await adminSupabase
          .from("clubs")
          .insert({ name: mockName })
          .select("id")
          .single()
        if (insErr || !inserted) {
          return { error: "Failed to seed club: " + (insErr?.message || "") }
        }
        finalClubId = inserted.id
      }
    } else {
      finalClubId = null
    }
  }

  // Handle banner upload to Cloudinary
  const bannerFile = formData.get("banner_file") as File
  let bannerUrl = null

  if (bannerFile && bannerFile.size > 0) {
    try {
      bannerUrl = await uploadImageToCloudinary(bannerFile, "banners")
    } catch (uploadErr: any) {
      return { error: "Banner upload failed: " + uploadErr.message }
    }
  }

  // Insert event
  const { data: event, error } = await supabase
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
      created_by: user.id,
      banner_url: bannerUrl
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/events")
  revalidatePath("/")
  return { success: "Event created successfully", event }
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

  revalidatePath("/admin/events")
  revalidatePath("/")
  return { success: `Event status updated to ${status.replace("_", " ")}` }
}

export async function registerForEventAction(
  eventId: string,
  regType: "individual" | "team",
  teamDetails?: { mode: "create" | "join"; teamName?: string; inviteCode?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be signed in to register." }

  let finalEventId = eventId

  // Resolve mock event ID to UUID
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
    const mockEvents: { [key: string]: string } = {
      "evt-1": "Tech Heist 2026",
      "evt-2": "Guest Lecture: Future of Web Development",
      "evt-3": "Valorant Campus Arena",
      "evt-4": "Guest Lecture: AI Trends",
      "mock-1": "Tech Heist 2026",
      "mock-2": "Inter-Department Cricket League",
      "mock-3": "Valorant Campus Arena"
    }
    const mockTitle = mockEvents[eventId] || "Tech Heist 2026"
    const { data: existing } = await supabase.from("events").select("id").eq("title", mockTitle).maybeSingle()
    if (existing) {
      finalEventId = existing.id
    } else {
      const adminSupabase = createAdminClient()
      // Find or create category
      const { data: cat } = await supabase.from("categories").select("id").limit(1).maybeSingle()
      let catId = cat?.id
      if (!catId) {
        const { data: newCat } = await adminSupabase.from("categories").insert({ name: "General", type: "technical" }).select("id").single()
        catId = newCat?.id
      }
      const { data: newEvt, error: evtErr } = await adminSupabase
        .from("events")
        .insert({
          title: mockTitle,
          description: "Auto-generated event for registrations seeding.",
          venue: "Esports Lab",
          event_date: new Date().toISOString().split("T")[0],
          event_time: "10:00:00",
          capacity: 100,
          category_id: catId,
          status: "published"
        })
        .select("id")
        .single()
      if (evtErr || !newEvt) {
        return { error: "Failed to seed event: " + evtErr.message }
      }
      finalEventId = newEvt.id
    }
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

  // Check capacity
  const { count: currentRegs } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", finalEventId)

  if (currentRegs && currentRegs >= event.capacity) {
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
    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .insert({
        event_id: finalEventId,
        user_id: user.id
      })
      .select()
      .single()

    if (regErr) return { error: regErr.message }

    // Auto-generate a ticket for the user
    const ticketCode = `CRA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    const adminSupabase = createAdminClient()
    await adminSupabase.from("tickets").insert({
      ticket_code: ticketCode,
      registration_id: reg.id
    })

    revalidatePath("/student")
    revalidatePath("/")
    return { success: "Registered successfully! Ticket generated." }
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
          invite_code: inviteCode
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
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .insert({
          event_id: finalEventId,
          user_id: user.id,
          team_id: team.id
        })
        .select()
        .single()

      if (regErr) return { error: regErr.message }

      // Auto-generate ticket
      const ticketCode = `CRA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      const adminSupabase = createAdminClient()
      await adminSupabase.from("tickets").insert({
        ticket_code: ticketCode,
        registration_id: reg.id
      })

      revalidatePath("/student")
      return { success: `Team created successfully! Invite code: ${inviteCode}`, inviteCode }
    }

    // Mode B: Join an existing team
    if (teamDetails.mode === "join") {
      if (!teamDetails.inviteCode) return { error: "Invite code is required." }

      // Find the team
      const { data: team, error: teamFindErr } = await supabase
        .from("teams")
        .select("id, max_members:event_id(max_team_size)")
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

      const maxLimit = (team as any).max_members?.max_team_size || event.max_team_size

      if (memberCount && memberCount >= maxLimit) {
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
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .insert({
          event_id: finalEventId,
          user_id: user.id,
          team_id: team.id
        })
        .select()
        .single()

      if (regErr) return { error: regErr.message }

      // Auto-generate ticket
      const ticketCode = `CRA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      const adminSupabase = createAdminClient()
      await adminSupabase.from("tickets").insert({
        ticket_code: ticketCode,
        registration_id: reg.id
      })

      revalidatePath("/student")
      return { success: "Joined team and registered successfully!" }
    }
  }

  return { error: "Invalid registration parameters." }
}

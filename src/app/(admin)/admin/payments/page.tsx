import { createAdminClient } from "@/lib/supabase/server"
import { PaymentsClient } from "../../../../components/admin/payments-client"

export default async function AdminPaymentsPage() {
  const supabase = createAdminClient()
  
  // Fetch registrations for paid events
  const { data: pendingRegs } = await supabase
    .from("registrations")
    .select(`
      id,
      created_at,
      payment_status,
      payment_screenshot_url,
      transaction_id,
      team_id,
      user_id,
      profiles (
        name,
        roll_number,
        email,
        mobile,
        departments (name),
        clubs (name)
      ),
      events!inner (
        id,
        title,
        fee_amount,
        is_paid
      ),
      teams (
        captain_id
      )
    `)
    .eq("events.is_paid", true)
    .order("created_at", { ascending: false })

  const payments = (pendingRegs || []).map((r: any) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    const event = Array.isArray(r.events) ? r.events[0] : r.events
    const team = Array.isArray(r.teams) ? r.teams[0] : r.teams
    
    // If it's a team registration, check if this user is the captain
    const isCaptain = r.team_id ? (team?.captain_id === r.user_id) : true

    return {
      id: r.id,
      created_at: r.created_at,
      payment_status: r.payment_status,
      payment_screenshot_url: r.payment_screenshot_url,
      transaction_id: r.transaction_id,
      team_id: r.team_id,
      is_captain: isCaptain,
      profiles: profile ? {
        name: profile.name,
        roll_number: profile.roll_number,
        email: profile.email,
        mobile: profile.mobile,
        department: (Array.isArray(profile.departments) ? profile.departments[0] : profile.departments)?.name || null,
        club: (Array.isArray(profile.clubs) ? profile.clubs[0] : profile.clubs)?.name || null
      } : null,
      events: event ? {
        id: event.id,
        title: event.title,
        fee_amount: event.fee_amount
      } : null
    }
  })

  return <PaymentsClient initialPayments={payments} />
}

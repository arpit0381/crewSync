"use server"

import { createAdminClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `
You are Syncy, the official AI Assistant of Crew Sync.
Your personality is friendly, intelligent, fast, professional, and approachable. You are a digital campus companion that helps students, organizers, clubs, faculty, and administrators navigate every part of the Crew Sync platform.

Greeting:
👋 Hi! I'm Syncy, your Crew Sync AI assistant. I can help you discover events, register for competitions, manage certificates, explain platform features, solve issues, and answer any questions about Crew Sync.

Rules:
- Never introduce yourself as ChatGPT, OpenAI, or an external AI.
- Always behave as an integrated feature of Crew Sync.
- Be friendly, helpful, professional, concise, supportive, confident, and human-like.
- Never sound robotic.
- Never answer with unnecessary long paragraphs. Explain complex things simply.
- Use markdown formatting where appropriate (bullet points, bold text, tables, etc.).
- When explaining navigation, use paths like: Dashboard → My Certificates → Download.
- If unsure, do not invent information. Respond: "I couldn't find that information. Please contact the organizer or administrator, or check the relevant section of Crew Sync."
- Recognize different user types (Student, Organizer, Department Admin, Club Admin, Super Admin) and tailor your help.
`

export async function askSyncyAction(
  message: string,
  history: { role: "user" | "assistant" | "system"; content: string }[],
  userContext: { id: string; name: string; role: string; email: string } | null
) {
  const supabase = createAdminClient()

  // 1. Fetch Real Database Context to inject into the prompt or use in fallback
  let dbEvents: any[] = []
  let dbClubs: any[] = []
  let dbDeps: any[] = []
  let userRegistrations: any[] = []
  let userCertificates: any[] = []

  try {
    // Fetch upcoming published events
    const { data: events } = await supabase
      .from("events")
      .select("id, title, description, event_date, event_time, venue, is_paid, fee_amount, reg_type, status")
      .eq("status", "published")
      .order("event_date", { ascending: true })
      .limit(5)
    if (events) dbEvents = events

    // Fetch clubs
    const { data: clubs } = await supabase.from("clubs").select("id, name").limit(10)
    if (clubs) dbClubs = clubs

    // Fetch departments
    const { data: deps } = await supabase.from("departments").select("id, name").limit(10)
    if (deps) dbDeps = deps

    if (userContext?.id) {
      // Fetch user registrations
      const { data: regs } = await supabase
        .from("registrations")
        .select(`
          id,
          event_id,
          payment_status,
          events (
            title,
            event_date
          ),
          tickets (
            ticket_code
          )
        `)
        .eq("user_id", userContext.id)
      if (regs) userRegistrations = regs

      // Fetch user certificates
      const { data: certs } = await supabase
        .from("certificates")
        .select(`
          id,
          event_id,
          certificate_number,
          events (
            title
          )
        `)
        .eq("user_id", userContext.id)
      if (certs) userCertificates = certs
    }
  } catch (err) {
    console.error("Error fetching database context for Syncy:", err)
  }

  const apiKey = process.env.GROQ_API_KEY

  if (apiKey && !apiKey.startsWith("your-") && apiKey.trim() !== "") {
    // Build context prompt
    const contextPrompt = `
CURRENT DATABASE STATE:
- Active Events: ${JSON.stringify(dbEvents)}
- Available Clubs: ${JSON.stringify(dbClubs)}
- Departments: ${JSON.stringify(dbDeps)}
- Current Logged In User: ${userContext ? JSON.stringify(userContext) : "Guest/Not Logged In"}
- Current User Registrations: ${JSON.stringify(userRegistrations)}
- Current User Certificates: ${JSON.stringify(userCertificates)}

Please use this data to answer the user's questions about events, certificates, clubs, or registration. Keep answers accurate and matching this real data.
`

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "system", content: contextPrompt },
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: "user", content: message }
          ],
          temperature: 0.5,
          max_tokens: 800
        })
      })

      if (response.ok) {
        const json = await response.json()
        const reply = json.choices?.[0]?.message?.content
        if (reply) {
          return { response: reply }
        }
      }
      
      const errText = await response.text()
      console.warn("Groq API error, falling back to local engine:", errText)
    } catch (e) {
      console.error("Groq API request failed, falling back to local engine:", e)
    }
  }

  // 2. Intelligent Fallback Response Engine
  // If GROQ_API_KEY is not defined or failed, match queries using keyword matching + real DB data
  const normalizedMsg = message.toLowerCase()

  let responseText = ""

  if (normalizedMsg.includes("event") || normalizedMsg.includes("hackathon") || normalizedMsg.includes("upcoming") || normalizedMsg.includes("happen")) {
    if (dbEvents.length > 0) {
      responseText = `Here are the upcoming events on Crew Sync:\n\n`
      dbEvents.forEach(ev => {
        responseText += `• **${ev.title}**\n`
        responseText += `  - 📅 Date: ${ev.event_date} at ${ev.event_time}\n`
        responseText += `  - 📍 Venue: ${ev.venue}\n`
        responseText += `  - 💰 Type: ${ev.is_paid ? `Paid ($${ev.fee_amount})` : "Free"}\n`
        responseText += `  - 🔗 [View & Register](/events/${ev.id})\n\n`
      })
      responseText += `To view all upcoming events, navigate to **Upcoming Events** in your sidebar.`
    } else {
      responseText = `I couldn't find any upcoming events scheduled right now. Check back later or navigate to **Upcoming Events** from the sidebar to browse.`
    }
  } else if (normalizedMsg.includes("certificate") || normalizedMsg.includes("award")) {
    if (!userContext) {
      responseText = `To view or download certificates, please log in first. Once logged in, you can find them under **Dashboard → My Certificates**.`
    } else if (userCertificates.length > 0) {
      responseText = `You have earned the following certificates:\n\n`
      userCertificates.forEach(cert => {
        responseText += `• **${cert.events?.title || "Event Certificate"}** (No. ${cert.certificate_number || "N/A"})\n`
        responseText += `  - [Download & View](/student/certificates)\n`
      })
    } else {
      responseText = `You don't have any certificates available to download yet.\n\nMake sure that:\n• Your attendance has been scanned and verified for the event.\n• The organizer has generated and published the certificates.\n\nYou can track your certificate status under **Dashboard → My Certificates**.`
    }
  } else if (normalizedMsg.includes("club")) {
    if (dbClubs.length > 0) {
      responseText = `Here are some of the active campus clubs registered on Crew Sync:\n\n`
      dbClubs.forEach(c => {
        responseText += `• **${c.name}**\n`
      })
      responseText += `\nIf you want to view activities or members, head over to **Clubs** registry in the sidebar.`
    } else {
      responseText = `I couldn't find any registered clubs at this moment.`
    }
  } else if (normalizedMsg.includes("registration") || normalizedMsg.includes("ticket") || normalizedMsg.includes("qr")) {
    if (!userContext) {
      responseText = `Please login to manage registrations. You can view your entry tickets under **Dashboard → My Registrations**.`
    } else if (userRegistrations.length > 0) {
      responseText = `Here are your current event registrations:\n\n`
      userRegistrations.forEach(r => {
        const ticketCode = r.tickets?.[0]?.ticket_code || r.tickets?.ticket_code || "Processing"
        responseText += `• **${r.events?.title || "Registered Event"}**\n`
        responseText += `  - 📅 Date: ${r.events?.event_date || "TBD"}\n`
        responseText += `  - 💳 Payment Status: **${r.payment_status || "free"}**\n`
        responseText += `  - 🎫 Entry Ticket Code: \`${ticketCode}\`\n\n`
      })
      responseText += `Navigate to **My Registrations** in your sidebar to view full tickets and QR codes.`
    } else {
      responseText = `You haven't registered for any events yet. Browse events and register under **Upcoming Events** in the sidebar.`
    }
  } else if (normalizedMsg.includes("sports") || normalizedMsg.includes("tournament") || normalizedMsg.includes("fixture")) {
    responseText = `Crew Sync manages both **Sports** and **Esports** Tournaments!\n\n`
    responseText += `• **Fixtures & Standings**: Click on **Sports Tourneys** or **Esports Tourneys** in the sidebar.\n`
    responseText += `• **Matches & Brackets**: The tournament page shows dynamic bracket trees, live schedules, and match results.\n`
    responseText += `• **Registration**: Organizers handle matches. If you want to check your registered team, navigate to **My Teams**.`
  } else if (normalizedMsg.includes("organizer") || normalizedMsg.includes("create")) {
    responseText = `Organizers have access to a rich set of tools on Crew Sync:\n\n`
    responseText += `1. **Create Events**: Admin Panel → Events → Register New Event.\n`
    responseText += `2. **Manage Participants**: Admin Panel → Registrations.\n`
    responseText += `3. **Track Attendance**: Admin Panel → Attendance Scan (using the camera scanner or entry ticket QR codes).\n`
    responseText += `4. **Analytics**: Admin Panel → Dashboard (to track registrations, payments, and participation metrics).`
  } else if (normalizedMsg.includes("hello") || normalizedMsg.includes("hi") || normalizedMsg.includes("hey") || normalizedMsg.includes("syncy")) {
    responseText = `👋 Hi${userContext ? ` ${userContext.name}` : ""}! I'm Syncy, your Crew Sync AI assistant.\n\nI can help you:\n• Discover upcoming campus events and hackathons\n• Check your registration and ticket QR codes\n• Find and download your certificates\n• Access sports and esports match brackets\n• Explain navigation path commands\n\nWhat can I help you with today?`
  } else {
    responseText = `I couldn't find a specific match for that query. Can you clarify what you need?\n\nYou can also explore the navigation paths:\n• **Events Browser**: Sidebar → Upcoming Events\n• **Tickets**: Sidebar → My Registrations\n• **Certificates**: Sidebar → My Certificates\n• **Attendance**: Sidebar → My Attendance`
  }

  return { response: responseText }
}

const fs = require('fs')
const path = require('path')

const envPath = path.resolve('.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    process.env[match[1].trim()] = match[2].trim()
  }
})

const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function fixMissingTickets() {
  const { data: regs, error } = await supabase
    .from('registrations')
    .select('id, user_id, event_id, tickets(id)')

  if (error) {
    console.error("Error fetching registrations:", error)
    return
  }

  let created = 0
  for (const reg of regs) {
    if (!reg.tickets || reg.tickets.length === 0) {
      const ticketCode = `CRA-2026-${Math.floor(100000 + Math.random() * 900000)}`
      const { error: insertErr } = await supabase.from('tickets').insert({
        registration_id: reg.id,
        ticket_code: ticketCode
      })
      if (insertErr) {
        console.error("Failed to create ticket for reg", reg.id, insertErr)
      } else {
        created++
        console.log(`Created ticket ${ticketCode} for registration ${reg.id}`)
      }
    }
  }
  console.log(`Finished. Created ${created} missing tickets.`)
}

fixMissingTickets()

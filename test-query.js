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
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) // Use SERVICE ROLE to see everything

async function test() {
  const { data: regs, error: err1 } = await supabase.from('registrations').select('*')
  console.log("All Registrations:", regs?.length)
  console.log("Reg Error:", err1)

  const { data: tickets, error: err2 } = await supabase.from('tickets').select('*')
  console.log("All Tickets:", tickets?.length)
  console.log("Ticket Error:", err2)
  
  if (regs && regs.length > 0) {
    console.log("Sample Reg:", regs[0])
  }
  if (tickets && tickets.length > 0) {
    console.log("Sample Ticket:", tickets[0])
  }
}

test()

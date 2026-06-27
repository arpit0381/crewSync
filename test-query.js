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
  const { data: regs, error: err1 } = await supabase
    .from('registrations')
    .select(`
      id,
      created_at,
      payment_status,
      payment_screenshot_url,
      transaction_id,
      profiles(name, roll_number, email, phone),
      events(title, fee_amount)
    `)
    .in("payment_status", ["pending_verification", "rejected"])
  
  console.log("Pending Regs with joins:", regs)
  console.log("Error:", err1)
}

test()

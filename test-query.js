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
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data: data2, error: error2 } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_code,
      registration:registration_id!inner (
        id,
        created_at,
        user_id,
        events:event_id (
          id,
          title
        )
      )
    `)
  console.log("Error with 'registration_id':", error2?.message || "No error")
  console.log("Data2 length:", data2?.length)
}

test()

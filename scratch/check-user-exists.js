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

async function test() {
  const emailToCheck = 'hello@arpitbajpai.in'
  const rollToCheck = '24116002142'

  console.log("Checking profiles table...")
  
  const { data: byEmail, error: errEmail } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', emailToCheck)
    
  console.log(`Profiles with email "${emailToCheck}":`, byEmail)
  if (errEmail) console.error("Email check error:", errEmail)

  const { data: byRoll, error: errRoll } = await supabase
    .from('profiles')
    .select('*')
    .eq('roll_number', rollToCheck)

  console.log(`Profiles with roll number "${rollToCheck}":`, byRoll)
  if (errRoll) console.error("Roll check error:", errRoll)
}

test()

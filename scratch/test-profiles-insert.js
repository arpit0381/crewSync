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
  // Try inserting a dummy profile
  const dummyId = '00000000-0000-0000-0000-000000000000'
  
  // First, clean up if it exists
  await supabase.from('profiles').delete().eq('id', dummyId)
  
  console.log("Inserting dummy profile...")
  const { data, error } = await supabase.from('profiles').insert({
    id: dummyId,
    name: 'Dummy Test User',
    roll_number: 'DUMMY123',
    mobile: '1234567890',
    role: 'student'
  }).select()
  
  console.log("Insert Result:", data)
  console.log("Insert Error:", error)
}

test()

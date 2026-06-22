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
  const email = `test-${Date.now()}@example.com`
  const password = "password123"
  
  console.log("Signing up with:", email)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: "Test User",
        roll_number: "24116002142",
        mobile: "09235823255",
        role: "student",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })
  
  console.log("Data:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}

test()

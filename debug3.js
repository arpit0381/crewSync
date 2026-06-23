import { createClient } from "@supabase/supabase-js"
import fs from "fs"

const envFile = fs.readFileSync(".env.local", "utf8")
const env = {}
envFile.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function debug() {
  const { data: attendances, error } = await supabase
    .from("attendance")
    .select("student_id, profiles(id, name, email, roll_number)")
    .eq("event_id", "d807b41c-a33d-48a1-b876-e47e75d921f8")

  console.log("ATTENDANCES:", attendances)
  console.log("ERROR:", error)
}

debug()

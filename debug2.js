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
  const { data: events } = await supabase.from("events").select("id, title")
  const { data: tournaments } = await supabase.from("tournaments").select("id, title")
  const { data: attendance } = await supabase.from("attendance").select("event_id, student_id")

  console.log("=== EVENTS ===")
  console.log(events?.filter(e => e.title.toLowerCase().includes("volley")))
  
  console.log("=== TOURNAMENTS ===")
  console.log(tournaments?.filter(t => t.title.toLowerCase().includes("volley")))
  
  console.log("=== ALL ATTENDANCE ===")
  console.log(attendance)
}

debug()

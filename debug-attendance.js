import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function debug() {
  const { data: events } = await supabase.from("events").select("id, title")
  const { data: tournaments } = await supabase.from("tournaments").select("id, title")
  const { data: attendance } = await supabase.from("attendance").select("event_id, student_id")
  const { data: certificates } = await supabase.from("certificates").select("event_id, user_id")

  console.log("EVENTS:", events)
  console.log("TOURNAMENTS:", tournaments)
  console.log("ATTENDANCE:", attendance)
  console.log("CERTIFICATES:", certificates)
}

debug()

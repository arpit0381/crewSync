import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Fetch user profile to redirect to their respective dashboard
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const role = user.user_metadata?.role || "student"
        if (next === "/") {
          const redirectPath = role === "student" ? "/student" : role === "tournament_admin" ? "/tournament" : "/admin"
          return NextResponse.redirect(`${origin}${redirectPath}`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}

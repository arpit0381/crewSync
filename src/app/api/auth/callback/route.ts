import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/"

  // 1. Handle direct token hash verification (e.g. password recovery link generated via Admin API)
  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any
    })
    
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // 2. Handle PKCE code exchange
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
          return NextResponse.redirect(`${baseUrl}${redirectPath}`)
        }
      }
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=Could not authenticate user`)
}

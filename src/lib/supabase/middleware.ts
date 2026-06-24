import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - IMPORTANT: use getUser(), not getSession() for security
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error("Middleware Supabase fetch error:", error)
    // Treat as unauthenticated if fetch fails (e.g. offline or DNS error)
  }

  const url = new URL(request.url)
  const path = url.pathname

  // 1. If trying to access protected routes and not logged in, redirect to login
  const isProtectedRoute =
    path.startsWith("/student") ||
    path.startsWith("/admin") ||
    path.startsWith("/tournament")

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(loginUrl)
  }

  // 2. If logged in and trying to access auth pages, redirect to dashboard
  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password")

  if (isAuthPage && user) {
    const role = user.user_metadata?.role || "student"
    if (role === "student") {
      return NextResponse.redirect(new URL("/student", request.url))
    } else if (role === "tournament_admin") {
      return NextResponse.redirect(new URL("/tournament", request.url))
    } else if (role === "scanner") {
      return NextResponse.redirect(new URL("/admin/attendance", request.url))
    } else {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  // 3. RBAC Route Guarding (based on user_metadata.role)
  if (user) {
    const role = user.user_metadata?.role || "student"

    // Protect /admin: only super_admin, department_admin, club_admin, tournament_admin, or scanner
    if (path.startsWith("/admin")) {
      const allowedRoles = ["super_admin", "department_admin", "club_admin", "tournament_admin", "scanner"]
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/student", request.url))
      }

      // Scanner can only access the attendance scanner and its child paths
      if (role === "scanner" && !path.startsWith("/admin/attendance")) {
        return NextResponse.redirect(new URL("/admin/attendance", request.url))
      }
    }

    // Protect /tournament: only super_admin or tournament_admin
    if (path.startsWith("/tournament")) {
      const allowedRoles = ["super_admin", "tournament_admin"]
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
    }
  }

  return supabaseResponse
}

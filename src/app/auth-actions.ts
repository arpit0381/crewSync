"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const role = data.user?.user_metadata?.role || "student"
  
  if (role === "student") {
    redirect("/student")
  } else if (role === "tournament_admin") {
    redirect("/tournament")
  } else {
    redirect("/admin")
  }
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const rollNumber = formData.get("roll_number") as string
  const mobile = formData.get("mobile") as string
  const role = (formData.get("role") as string) || "student"

  if (!email || !password || !name) {
    return { error: "Name, email and password are required" }
  }

  const supabase = await createClient()
  
  // Sign up with user metadata, which handle_new_user trigger maps to profile table
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        roll_number: rollNumber || null,
        mobile: mobile || null,
        role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Registration successful! Please check your email for the verification link." }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Password reset link sent to your email!" }
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get("password") as string

  if (!password) {
    return { error: "New password is required" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/login?message=Password updated successfully")
}

export async function updateUserRoleAction(userId: string, role: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) return { error: error.message }
  return { success: "User role updated successfully" }
}

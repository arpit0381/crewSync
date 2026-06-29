"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { sendResendEmail } from "@/app/certificate-actions"

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectUrl = formData.get("redirect") as string

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
  
  if (redirectUrl) {
    redirect(redirectUrl)
  }

  if (role === "student") {
    redirect("/student")
  } else if (role === "tournament_admin") {
    redirect("/tournament")
  } else if (role === "scanner") {
    redirect("/admin/attendance")
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
  const departmentId = formData.get("department_id") as string
  const section = formData.get("section") as string
  const role = "student" // Hardcoded to student for registration

  if (!email || !password || !name || !departmentId || !section) {
    return { error: "Name, email, password, department, and section are required" }
  }

  const supabase = await createClient()

  // Pre-validate uniqueness of email and roll number to prevent DB trigger constraint failures
  const { data: existingEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existingEmail) {
    return { error: "This Email is already registered to another account." }
  }

  if (rollNumber) {
    const { data: existingRoll } = await supabase
      .from("profiles")
      .select("id")
      .eq("roll_number", rollNumber)
      .maybeSingle()

    if (existingRoll) {
      return { error: "This Roll Number is already registered to another account." }
    }
  }
  
  // Sign up with user metadata, which handle_new_user trigger maps to profile table
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        roll_number: rollNumber ? rollNumber : null,
        mobile: mobile ? mobile : null,
        role,
        department_id: departmentId,
        section: section
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
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

  try {
    const adminClient = createAdminClient()
    
    // Generate the recovery link via Supabase Auth Admin API (without sending email)
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?next=/reset-password`,
      }
    })

    if (error) {
      return { error: error.message }
    }

    let tokenHash: string | null = data.properties?.hashed_token || null
    if (!tokenHash && data.properties?.action_link) {
      const url = new URL(data.properties.action_link)
      tokenHash = url.searchParams.get("token")
    }

    if (!tokenHash) {
      return { error: "Failed to generate password recovery link token." }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const actionLink = `${appUrl}/api/auth/callback?token_hash=${tokenHash}&type=recovery&next=/reset-password`

    // Build the premium HTML template
    const subject = "Reset Your Password - Crew Sync"
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0f; color: #f4f4f5; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #1f1f2e; text-align: center;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 800; letter-spacing: 0.05em; color: #ffffff;">
            CREW <span style="color: #3b82f6;">SYNC</span>
          </span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">Reset Your Password</h2>
        <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 30px; max-width: 480px; margin-left: auto; margin-right: auto;">
          You requested to reset your password for your Crew Sync account. Click the button below to secure your account and set a new password.
        </p>
        <div style="margin-bottom: 30px;">
          <a href="${actionLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.2s ease;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 11px; color: #71717a; line-height: 1.6; max-width: 400px; margin: 0 auto 16px;">
          If you did not request a password reset, you can safely ignore this email. The link will expire in 24 hours.
        </p>
        <div style="border-top: 1px solid #1f1f2e; padding-top: 20px; font-size: 11px; color: #71717a;">
          Crew Sync Campus Portal • Built by Arpit Bajpai
        </div>
      </div>
    `

    // Send the email via Resend
    const res = await sendResendEmail({
      to: email,
      subject,
      html
    })

    if (res.error) {
      return { error: res.error }
    }

    return { success: "Password reset link sent to your email!" }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
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
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return { error: "Unauthorized" }
  }

  if (session.user.user_metadata?.role !== 'super_admin') {
    return { error: "Only super admin can update user roles" }
  }

  const adminClient = createAdminClient()
  
  // 1. Update auth metadata so middleware RBAC works
  const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: { role }
  })
  if (authError) return { error: authError.message }

  // 2. Update profiles table (bypasses RLS)
  const { error } = await adminClient
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) return { error: error.message }
  return { success: "User role updated successfully" }
}

export async function updateProfileAction(data: {
  name: string
  roll_number?: string
  mobile?: string
  department_id?: string
  club_id?: string
  section?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to update your profile." }
  }

  // If a roll_number is provided, check if it's already used by another user
  if (data.roll_number) {
    const { data: existingRoll } = await supabase
      .from("profiles")
      .select("id")
      .eq("roll_number", data.roll_number)
      .neq("id", user.id)
      .maybeSingle()

    if (existingRoll) {
      return { error: "This Roll Number is already registered to another account." }
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      roll_number: data.roll_number || null,
      mobile: data.mobile || null,
      department_id: data.department_id || null,
      club_id: data.club_id || null,
      section: data.section || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  // Optionally update auth user metadata
  await supabase.auth.updateUser({
    data: {
      name: data.name,
      roll_number: data.roll_number || null,
      mobile: data.mobile || null,
      section: data.section || null
    }
  })

  return { success: "Profile updated successfully." }
}

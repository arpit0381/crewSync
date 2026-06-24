"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signInAction } from "@/app/auth-actions"
import { ShieldCheck, Loader2 } from "lucide-react"

function LoginForm() {
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get("error")
  const successMsg = searchParams.get("message")

  const [error, setError] = React.useState<string | null>(errorMsg)
  const [success, setSuccess] = React.useState<string | null>(successMsg)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await signInAction(formData)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-sm text-center">
          {success}
        </div>
      )}

      {/* Hidden input to pass redirect URL to server action */}
      <input type="hidden" name="redirect" value={searchParams.get("redirect") || ""} />

      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all"
            placeholder="name@college.edu"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Password
          </label>
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : (
            "Sign In"
          )}
        </button>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border shadow-xl group hover:border-primary/50 transition-all duration-300">
            <ShieldCheck className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Welcome back to Crew Sync
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One Sync. Every Event.
          </p>
        </div>

        <div className="mt-8 bg-card/60 backdrop-blur-xl border border-border/80 p-8 rounded-3xl shadow-2xl">
          <React.Suspense fallback={
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          }>
            <LoginForm />
          </React.Suspense>

          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

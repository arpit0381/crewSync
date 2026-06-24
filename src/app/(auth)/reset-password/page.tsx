"use client"

import * as React from "react"
import { updatePasswordAction } from "@/app/auth-actions"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updatePasswordAction(formData)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

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
          <div className="mx-auto relative h-14 w-14 overflow-hidden rounded-2xl border border-border/30 shadow-xl group hover:border-primary/50 transition-all duration-300 bg-card">
            <img src="/icons/icon-192x192.png" alt="Crew Sync Logo" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Set new password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please enter your new password below
          </p>
        </div>

        <div className="mt-8 bg-card/60 backdrop-blur-xl border border-border/80 p-8 rounded-3xl shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                New Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
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
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

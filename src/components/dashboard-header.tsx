"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme as useNextTheme } from "next-themes"
import { useTheme, type ThemePack } from "@/components/theme-provider"
import { NotificationBell } from "@/components/notification-bell"
import { signOutAction } from "@/app/auth-actions"
import { 
  Sun, 
  Moon, 
  Palette, 
  LogOut, 
  User, 
  Menu,
  ShieldAlert
} from "lucide-react"

interface DashboardHeaderProps {
  userEmail?: string
  userName?: string
  userRole?: string
  toggleSidebar?: () => void
}

export function DashboardHeader({ userEmail, userName, userRole, toggleSidebar }: DashboardHeaderProps) {
  const { setTheme, resolvedTheme } = useNextTheme()
  const { themePack, setThemePack } = useTheme()
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown on Escape key
  React.useEffect(() => {
    if (!dropdownOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [dropdownOpen])

  const packs: { name: ThemePack; color: string; label: string }[] = [
    { name: "blue", color: "bg-blue-600", label: "Blue Default" },
    { name: "emerald", color: "bg-emerald-600", label: "Emerald" },
    { name: "purple", color: "bg-purple-600", label: "Purple" },
    { name: "crimson", color: "bg-rose-600", label: "Crimson" },
    { name: "orange", color: "bg-orange-600", label: "Orange" },
    { name: "college", color: "bg-indigo-900", label: "College Custom" },
  ]

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 hover:bg-muted md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="relative h-6 w-6 overflow-hidden rounded-lg border border-border/30 shrink-0 shadow-sm">
            <Image src="/icons/icon-192x192.png" alt="Crew Sync Logo" width={24} height={24} className="object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Crew <span className="text-primary">Sync</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {userEmail && <NotificationBell />}
        {/* Theme Pack Switcher Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors text-foreground"
          >
            <Palette className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="capitalize hidden sm:inline">{themePack}</span>
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Theme Accent
                </p>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {packs.map((pack) => (
                    <button
                      key={pack.name}
                      onClick={() => {
                        setThemePack(pack.name)
                        setDropdownOpen(false)
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium hover:bg-muted transition-all ${
                        themePack === pack.name ? "bg-muted text-primary" : "text-foreground"
                      }`}
                    >
                      <span className={`h-3 w-3 rounded-full ${pack.color} border border-white/20`} />
                      <span className="truncate">{pack.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Light/Dark Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 hover:bg-muted text-foreground transition-colors border border-border"
          aria-label="Toggle theme mode"
        >
          {!mounted ? (
            <div className="h-4 w-4" />
          ) : resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* User profile dropdown and signout */}
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="hidden flex-col text-right md:flex">
            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
              {userName || "User"}
            </span>
            <span className="text-[10px] text-muted-foreground capitalize">
              {userRole?.replace("_", " ") || "student"}
            </span>
          </div>
          
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg p-2 hover:bg-red-950/20 hover:text-red-500 text-muted-foreground transition-colors border border-border"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

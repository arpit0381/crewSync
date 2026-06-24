"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Calendar, 
  Ticket, 
  Users, 
  CheckSquare, 
  Award, 
  User, 
  Settings, 
  Trophy, 
  Gamepad, 
  Building, 
  Flag,
  GitFork,
  X
} from "lucide-react"

interface SidebarItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface DashboardSidebarProps {
  role: string
  isOpen: boolean
  onClose: () => void
}

export function DashboardSidebar({ role, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  // Close sidebar on Escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const studentItems: SidebarItem[] = [
    { label: "Home", href: "/student", icon: Home },
    { label: "Upcoming Events", href: "/student/events", icon: Calendar },
    { label: "My Registrations", href: "/student/registrations", icon: Ticket },
    { label: "My Teams", href: "/student/teams", icon: Users },
    { label: "My Attendance", href: "/student/attendance", icon: CheckSquare },
    { label: "My Certificates", href: "/student/certificates", icon: Award },
    { label: "Profile", href: "/student/profile", icon: User },
  ]

  const adminItems: SidebarItem[] = [
    { label: "Dashboard", href: "/admin", icon: Home },
    { label: "Events", href: "/admin/events", icon: Calendar },
    { label: "Registrations", href: "/admin/registrations", icon: Ticket },
    { label: "Attendance Scan", href: "/admin/attendance", icon: CheckSquare },
    { label: "Sports Tourneys", href: "/admin/sports", icon: Trophy },
    { label: "Esports Tourneys", href: "/admin/esports", icon: Gamepad },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "Departments", href: "/admin/departments", icon: Building },
    { label: "Clubs", href: "/admin/clubs", icon: Flag },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
  ]

  const tournamentItems: SidebarItem[] = [
    { label: "Home Dashboard", href: "/tournament", icon: Home },
    { label: "Team Manager", href: "/tournament/teams", icon: Users },
    { label: "Matches & Fixtures", href: "/tournament/matches", icon: Calendar },
    { label: "Brackets View", href: "/tournament/brackets", icon: GitFork },
    { label: "Tournament Standings", href: "/tournament/results", icon: Trophy },
  ]

  const scannerItems: SidebarItem[] = [
    { label: "Attendance Scan", href: "/admin/attendance", icon: CheckSquare },
  ]

  const getItems = () => {
    switch (role) {
      case "super_admin":
      case "department_admin":
      case "club_admin":
        return adminItems
      case "tournament_admin":
        return tournamentItems
      case "scanner":
        return scannerItems
      default:
        return studentItems
    }
  }

  const items = getItems()

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden" 
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-transform duration-300 md:sticky md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 md:justify-center">
          <div className="flex items-center gap-2.5">
            <div className="relative h-6 w-6 overflow-hidden rounded-lg border border-border/30 shrink-0 shadow-sm">
              <Image src="/icons/icon-192x192.png" alt="Crew Sync Logo" width={24} height={24} className="object-cover" />
            </div>
            <span className="text-lg font-extrabold tracking-wider text-foreground">
              CREW <span className="text-primary">SYNC</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.01]"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  )
}

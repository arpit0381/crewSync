"use client"

import * as React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

interface DashboardLayoutClientProps {
  userEmail?: string
  userName?: string
  userRole?: string
  children: React.ReactNode
}

export function DashboardLayoutClient({
  userEmail,
  userName,
  userRole = "student",
  children,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen w-full bg-background select-none">
      <DashboardSidebar
        role={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          userEmail={userEmail}
          userName={userName}
          userRole={userRole}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-200">
          {children}
        </main>
      </div>
    </div>
  )
}

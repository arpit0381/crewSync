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

  const handleCloseSidebar = React.useCallback(() => setSidebarOpen(false), [])
  const handleToggleSidebar = React.useCallback(() => setSidebarOpen(prev => !prev), [])

  return (
    <div className="flex min-h-screen w-full bg-background select-none">
      <DashboardSidebar
        role={userRole}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          userEmail={userEmail}
          userName={userName}
          userRole={userRole}
          toggleSidebar={handleToggleSidebar}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 transition-all duration-200">
          {children}
        </main>
      </div>
    </div>
  )
}

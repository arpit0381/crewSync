"use client"

import dynamic from "next/dynamic"

export const AnalyticsCharts = dynamic(
  () => import("@/components/admin/analytics-charts").then(mod => ({ default: mod.AnalyticsCharts })),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full bg-card/10 rounded-2xl border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading analytics charts...
      </div>
    ),
  }
)

export const AttendanceScannerClient = dynamic(
  () => import("@/components/admin/attendance-scanner-client").then(mod => ({ default: mod.AttendanceScannerClient })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-card/10 rounded-2xl border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading QR scanner...
      </div>
    ),
  }
)

export const CertificatesClient = dynamic(
  () => import("@/components/student/certificates-client").then(mod => ({ default: mod.CertificatesClient })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-card/10 rounded-2xl border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading certificates...
      </div>
    ),
  }
)

export const TicketsClient = dynamic(
  () => import("@/components/student/tickets-client").then(mod => ({ default: mod.TicketsClient })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-card/10 rounded-2xl border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading tickets...
      </div>
    ),
  }
)

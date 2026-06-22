"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

interface AnalyticsChartsProps {
  trendData: { name: string; registrations: number; checkins: number }[]
  deptData: { name: string; students: number }[]
}

export function AnalyticsCharts({ trendData = [], deptData = [] }: AnalyticsChartsProps) {
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch since Recharts does client calculations
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-72 w-full bg-card/10 rounded-2xl border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading analytics charts...
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Area Chart: Registrations vs Check-Ins */}
      <div className="rounded-3xl border border-border bg-card/20 p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Registration vs Attendance Trends</h3>
          <p className="text-xs text-muted-foreground">Cumulative metrics count recorded this week.</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="checkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "var(--color-foreground)"
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Area
                name="Total Signups"
                type="monotone"
                dataKey="registrations"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#regGrad)"
              />
              <Area
                name="Checked In"
                type="monotone"
                dataKey="checkins"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#checkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Bar Chart: Department-wise split */}
      <div className="rounded-3xl border border-border bg-card/20 p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Department Participation</h3>
          <p className="text-xs text-muted-foreground">Distribution of registered students across courses.</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "var(--color-foreground)"
                }}
              />
              <Bar
                name="Students Count"
                dataKey="students"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

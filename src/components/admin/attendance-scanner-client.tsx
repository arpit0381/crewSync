"use client"

import * as React from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { verifyAndCheckInAction } from "@/app/attendance-actions"
import { Camera, CheckCircle, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react"

interface Event {
  id: string
  title: string
  venue: string
  event_date: string
}

interface ScanLog {
  id: string
  time: string
  code: string
  status: "success" | "warning" | "error"
  message: string
  student?: string
}

interface AttendanceScannerClientProps {
  events: Event[]
}

export function AttendanceScannerClient({ events }: AttendanceScannerClientProps) {
  const [selectedEventId, setSelectedEventId] = React.useState(events[0]?.id || "")
  const [scannerActive, setScannerActive] = React.useState(false)
  const [scanLogs, setScanLogs] = React.useState<ScanLog[]>([])
  const [scanLock, setScanLock] = React.useState(false)
  
  // Stats
  const [successCount, setSuccessCount] = React.useState(0)

  React.useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null

    if (scannerActive) {
      // Cooldown buffer function
      const onScanSuccess = async (decodedText: string) => {
        if (scanLock) return
        
        // Lock scanner during DB round-trip to prevent duplicate requests
        setScanLock(true)
        
        try {
          const result = await verifyAndCheckInAction(decodedText)
          const newLog: ScanLog = {
            id: Math.random().toString(),
            time: new Date().toLocaleTimeString(),
            code: decodedText,
            status: result.error ? "error" : result.warning ? "warning" : "success",
            message: result.error 
              ? result.error 
              : result.warning 
                ? `${result.warning} already check-in for ${result.eventTitle}` 
                : `Successfully checked in to ${result.eventTitle}`,
            student: result.studentName ? `${result.studentName} (${result.rollNumber})` : undefined
          }

          if (result.success) {
            setSuccessCount((prev) => prev + 1)
          }

          setScanLogs((prev) => [newLog, ...prev])
        } catch (err: any) {
          setScanLogs((prev) => [
            {
              id: Math.random().toString(),
              time: new Date().toLocaleTimeString(),
              code: decodedText,
              status: "error",
              message: "Network check-in error: " + err.message
            },
            ...prev
          ])
        } finally {
          // Release lock after 2.5 seconds cooldown
          setTimeout(() => {
            setScanLock(false)
          }, 2500)
        }
      }

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        },
        /* verbose= */ false
      )

      scanner.render(onScanSuccess, (error) => {
        // Silent error logs on QR scanner scan cycles
      })
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.warn("Failed to clear scanner:", err))
      }
    }
  }, [scannerActive, scanLock])

  const toggleScanner = () => {
    setScannerActive(!scannerActive)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">QR Attendance Scanner</h1>
        <p className="text-sm text-zinc-400">Scan student ticket QR codes to record entry attendance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Scan Controls & Camera View */}
        <div className="md:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm transition-all"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.venue})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-300">Scanner Status</span>
              <button
                onClick={toggleScanner}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                  scannerActive 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-primary/20"
                }`}
              >
                <Camera className="h-4 w-4" />
                {scannerActive ? "Stop Camera" : "Start Camera Scan"}
              </button>
            </div>
          </div>

          {/* Camera Frame */}
          <div className="flex-1 flex items-center justify-center min-h-[320px] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden mt-4 relative">
            {scannerActive ? (
              <div id="qr-reader" className="w-full h-full max-w-[400px] border-none" />
            ) : (
              <div className="text-center space-y-2 text-zinc-600 p-6">
                <Camera className="h-12 w-12 mx-auto stroke-[1.5]" />
                <p className="text-sm font-medium">Camera is disabled</p>
                <p className="text-xs">Click Start Camera Scan to enable scanner.</p>
              </div>
            )}
            
            {scanLock && (
              <div className="absolute inset-0 bg-zinc-950/70 flex flex-col items-center justify-center gap-2 animate-fade-in z-20">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-zinc-300 font-bold">Verifying Ticket...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Real-time Stats & logs */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col justify-between h-[520px]">
          <div className="space-y-4 overflow-hidden flex flex-col flex-1">
            <h2 className="text-lg font-bold text-white">Live Scan Logger</h2>
            
            <div className="flex gap-4 border-b border-zinc-800 pb-3 shrink-0">
              <div className="flex-1 text-center bg-zinc-950 rounded-xl py-2.5 border border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Total Scans</p>
                <p className="text-xl font-bold text-white mt-0.5">{scanLogs.length}</p>
              </div>
              <div className="flex-1 text-center bg-zinc-950 rounded-xl py-2.5 border border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Checked In</p>
                <p className="text-xl font-bold text-primary mt-0.5">{successCount}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {scanLogs.length === 0 ? (
                <div className="text-center text-zinc-600 text-xs py-12">
                  No tickets scanned in this session.
                </div>
              ) : (
                scanLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`rounded-xl border p-3 flex gap-3 text-xs ${
                      log.status === "success"
                        ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-300"
                        : log.status === "warning"
                          ? "bg-amber-950/20 border-amber-900/50 text-amber-300"
                          : "bg-red-950/20 border-red-900/50 text-red-300"
                    }`}
                  >
                    {log.status === "success" && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
                    {log.status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />}
                    {log.status === "error" && <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
                    
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-zinc-500">{log.code}</span>
                        <span className="text-[9px] text-zinc-500">{log.time}</span>
                      </div>
                      {log.student && <p className="font-semibold">{log.student}</p>}
                      <p className="text-[11px] leading-snug">{log.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

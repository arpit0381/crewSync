"use client"

import * as React from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { verifyAndCheckInAction } from "@/app/attendance-actions"
import { Camera, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, XCircle } from "lucide-react"

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
  const scanLockRef = React.useRef(false)
  const [cameraError, setCameraError] = React.useState<string | null>(null)
  
  // Stats
  const [successCount, setSuccessCount] = React.useState(0)

  // Sync ref with state for scanner callback access without re-binding
  React.useEffect(() => {
    scanLockRef.current = scanLock
  }, [scanLock])

  React.useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null
    let isMounted = true

    if (scannerActive) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API not supported. Please use HTTPS or localhost.")
        return
      }
      setCameraError(null)

      // Cooldown buffer function
      const onScanSuccess = async (decodedText: string) => {
        if (scanLockRef.current) return
        
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
                ? `${result.warning} already checked in` 
                : `Successfully checked in`,
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
              message: "Network error: " + err.message
            },
            ...prev
          ])
        } finally {
          // Release lock after 2.5 seconds cooldown
          setTimeout(() => {
            if (isMounted) setScanLock(false)
          }, 2500)
        }
      }

      // Delay slightly to ensure DOM element exists before injecting scanner
      const initTimer = setTimeout(() => {
        if (!isMounted) return;
        try {
          scanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0 
            },
            false
          )

          scanner.render(onScanSuccess, () => {})
        } catch (err: any) {
          console.error("Scanner init error:", err)
          setCameraError(err.message || "Failed to start camera.")
        }
      }, 100)

      return () => {
        isMounted = false
        clearTimeout(initTimer)
        if (scanner) {
          try {
            scanner.clear().catch(console.warn)
          } catch (e) {
            console.warn("Scanner cleanup failed", e)
          }
        }
      }
    }
  }, [scannerActive])

  const toggleScanner = () => {
    setScannerActive(!scannerActive)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">QR Attendance Scanner</h1>
        <p className="text-sm text-muted-foreground">Scan student ticket QR codes to record entry attendance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Scan Controls & Camera View */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-card/20 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.venue})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Scanner Status</span>
              <button
                onClick={toggleScanner}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                  scannerActive 
                    ? "bg-red-500 hover:bg-red-600 text-foreground" 
                    : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-primary/20"
                }`}
              >
                <Camera className="h-4 w-4" />
                {scannerActive ? "Stop Camera" : "Start Camera Scan"}
              </button>
            </div>
          </div>

          {/* Camera Frame */}
          <div className="flex-1 flex items-center justify-center min-h-[320px] bg-background border border-border rounded-2xl overflow-hidden mt-4 relative">
            {cameraError ? (
              <div className="text-center space-y-2 text-destructive p-6">
                <XCircle className="h-12 w-12 mx-auto stroke-[1.5]" />
                <p className="text-sm font-bold">Camera Access Denied</p>
                <p className="text-xs text-muted-foreground">{cameraError}</p>
                <button 
                  onClick={() => setScannerActive(false)} 
                  className="mt-4 rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground"
                >
                  Close
                </button>
              </div>
            ) : scannerActive ? (
              <div id="qr-reader" className="w-full h-full max-w-[400px] border-none" />
            ) : (
              <div className="text-center space-y-2 text-muted-foreground p-6">
                <Camera className="h-12 w-12 mx-auto stroke-[1.5]" />
                <p className="text-sm font-medium">Camera is disabled</p>
                <p className="text-xs">Click Start Camera Scan to enable scanner.</p>
              </div>
            )}
            
            {scanLock && (
              <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2 animate-fade-in z-20">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-foreground font-bold">Verifying Ticket...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Real-time Stats & logs */}
        <div className="rounded-3xl border border-border bg-card/20 p-6 flex flex-col justify-between min-h-[400px] max-h-[calc(100vh-200px)]">
          <div className="space-y-4 overflow-hidden flex flex-col flex-1">
            <h2 className="text-lg font-bold text-foreground">Live Scan Logger</h2>
            
            <div className="flex gap-4 border-b border-border pb-3 shrink-0">
              <div className="flex-1 text-center bg-background rounded-xl py-2.5 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Scans</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{scanLogs.length}</p>
              </div>
              <div className="flex-1 text-center bg-background rounded-xl py-2.5 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Checked In</p>
                <p className="text-xl font-bold text-primary mt-0.5">{successCount}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {scanLogs.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-12">
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
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">{log.code}</span>
                        <span className="text-[9px] text-muted-foreground">{log.time}</span>
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

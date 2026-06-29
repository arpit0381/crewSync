"use client"

import * as React from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { verifyAndCheckInAction } from "@/app/attendance-actions"
import { Camera, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, XCircle, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  roll?: string
}

interface AttendanceScannerClientProps {
  events: Event[]
}

const playBeep = (type: "success" | "error" | "warning") => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    // Ignore audio errors
  }
}

export function AttendanceScannerClient({ events }: AttendanceScannerClientProps) {
  const [selectedEventId, setSelectedEventId] = React.useState(events[0]?.id || "")
  const [scannerActive, setScannerActive] = React.useState(false)
  const [scanLogs, setScanLogs] = React.useState<ScanLog[]>([])
  const [scanLock, setScanLock] = React.useState(false)
  const scanLockRef = React.useRef(false)
  const [cameraError, setCameraError] = React.useState<string | null>(null)
  
  const [lastScan, setLastScan] = React.useState<ScanLog | null>(null)
  const [overlayVisible, setOverlayVisible] = React.useState(false)
  
  // Stats
  const [totalRegs, setTotalRegs] = React.useState(0)
  const [totalCheckins, setTotalCheckins] = React.useState(0)
  
  const supabase = createClient()

  // Fetch stats when event changes
  React.useEffect(() => {
    async function fetchStats() {
      if (!selectedEventId) return
      
      const [regsResult, attResult] = await Promise.all([
        supabase.from("registrations").select("*", { count: "exact", head: true }).eq("event_id", selectedEventId),
        supabase.from("attendance").select("*", { count: "exact", head: true }).eq("event_id", selectedEventId)
      ])
      
      setTotalRegs(regsResult.count || 0)
      setTotalCheckins(attResult.count || 0)
    }
    fetchStats()
  }, [selectedEventId, supabase])

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

      const onScanSuccess = async (decodedText: string) => {
        if (scanLockRef.current) return
        
        // Lock scanner during DB round-trip
        setScanLock(true)
        
        try {
          const result = await verifyAndCheckInAction(decodedText, selectedEventId)
          
          const status = result.error ? "error" : result.warning ? "warning" : "success"
          playBeep(status)
          
          const newLog: ScanLog = {
            id: Math.random().toString(),
            time: new Date().toLocaleTimeString(),
            code: decodedText,
            status: status,
            message: result.error 
              ? result.error 
              : result.warning 
                ? `${result.warning} already checked in` 
                : `Successfully checked in`,
            student: result.studentName,
            roll: result.rollNumber
          }

          if (result.success) {
            setTotalCheckins((prev) => prev + 1)
          }

          setLastScan(newLog)
          setOverlayVisible(true)
          setScanLogs((prev) => [newLog, ...prev])
          
          // Hide overlay after 3 seconds
          setTimeout(() => {
            if (isMounted) setOverlayVisible(false)
          }, 3000)
          
        } catch (err: any) {
          playBeep("error")
          const newLog: ScanLog = {
            id: Math.random().toString(),
            time: new Date().toLocaleTimeString(),
            code: decodedText,
            status: "error",
            message: "Network error: " + err.message
          }
          setLastScan(newLog)
          setOverlayVisible(true)
          setScanLogs((prev) => [newLog, ...prev])
          setTimeout(() => {
            if (isMounted) setOverlayVisible(false)
          }, 3000)
        } finally {
          // Release lock after 3 seconds cooldown
          setTimeout(() => {
            if (isMounted) setScanLock(false)
          }, 3000)
        }
      }

      const initTimer = setTimeout(() => {
        if (!isMounted) return;
        try {
          scanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 10, 
              qrbox: { width: 280, height: 280 },
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
  }, [scannerActive, selectedEventId])

  const toggleScanner = () => {
    // Need user gesture to initialize AudioContext, so play a silent beep if starting
    if (!scannerActive) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) new AudioContext().resume();
      } catch(e) {}
    }
    setScannerActive(!scannerActive)
  }

  // Determine overlay colors
  let overlayColor = "bg-background/80 backdrop-blur-sm"
  let textColor = "text-foreground"
  let borderColor = "border-border"
  
  if (overlayVisible && lastScan) {
    if (lastScan.status === "success") {
      overlayColor = "bg-emerald-500/95 backdrop-blur-md"
      textColor = "text-emerald-50"
      borderColor = "border-emerald-400"
    } else if (lastScan.status === "warning") {
      overlayColor = "bg-amber-500/95 backdrop-blur-md"
      textColor = "text-amber-50"
      borderColor = "border-amber-400"
    } else {
      overlayColor = "bg-red-500/95 backdrop-blur-md"
      textColor = "text-red-50"
      borderColor = "border-red-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Access Control</h1>
          <p className="text-sm text-muted-foreground">Secure event-wise QR scanning with real-time validation.</p>
        </div>
        <div className="bg-card/40 border border-border px-4 py-2 rounded-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Checked In:</span>
          </div>
          <span className="text-xl font-bold text-primary">{totalCheckins}</span>
          <span className="text-xl font-bold text-muted-foreground/30">/</span>
          <span className="text-xl font-bold text-foreground">{totalRegs}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Scan Controls & Camera View */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-card/20 p-6 space-y-6 flex flex-col">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Event Gate</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={scannerActive}
                className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm font-medium transition-all disabled:opacity-50"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} • {e.venue}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Scanner Status</span>
              <button
                onClick={toggleScanner}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-md ${
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
          <div className="flex-1 min-h-[400px] bg-black border border-zinc-800 rounded-2xl overflow-hidden relative shadow-inner">
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 text-destructive p-6 bg-background">
                <XCircle className="h-12 w-12 mx-auto stroke-[1.5]" />
                <p className="text-sm font-bold">Camera Access Denied</p>
                <p className="text-xs text-muted-foreground">{cameraError}</p>
              </div>
            ) : scannerActive ? (
              <div id="qr-reader" className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full border-none" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-muted-foreground p-6 bg-background select-none">
                <img 
                  src="/icons/undraw_qr-code-scan_bewe.svg" 
                  alt="QR code scan illustration" 
                  className="w-48 h-48 object-contain opacity-75 mb-2"
                />
                <p className="text-sm font-semibold text-foreground">Camera is disabled</p>
                <p className="text-xs text-muted-foreground">Select an event gate above and start the scanner.</p>
              </div>
            )}
            
            {/* Scan Result Overlay */}
            {overlayVisible && lastScan && (
              <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-200 ${overlayColor}`}>
                <div className="text-center space-y-4 w-full max-w-sm">
                  {lastScan.status === "success" && <CheckCircle className={`h-24 w-24 mx-auto ${textColor}`} />}
                  {lastScan.status === "warning" && <AlertTriangle className={`h-24 w-24 mx-auto ${textColor}`} />}
                  {lastScan.status === "error" && <XCircle className={`h-24 w-24 mx-auto ${textColor}`} />}
                  
                  <h2 className={`text-3xl font-black uppercase tracking-widest ${textColor}`}>
                    {lastScan.status === "success" ? "Access Granted" : lastScan.status === "warning" ? "Duplicate" : "Access Denied"}
                  </h2>
                  
                  {lastScan.student && (
                    <div className={`p-4 rounded-xl border ${borderColor} bg-black/20`}>
                      <p className={`text-2xl font-bold ${textColor}`}>{lastScan.student}</p>
                      {lastScan.roll && <p className={`text-lg font-mono opacity-80 ${textColor}`}>{lastScan.roll}</p>}
                    </div>
                  )}
                  
                  <p className={`text-sm font-medium ${textColor}`}>{lastScan.message}</p>
                </div>
              </div>
            )}
            
            {/* Loading / Verifying Overlay */}
            {scanLock && !overlayVisible && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-10 backdrop-blur-sm">
                <RefreshCw className="h-10 w-10 text-white animate-spin" />
                <span className="text-sm text-white font-bold tracking-widest uppercase">Verifying...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Scan History Sidebar */}
        <div className="rounded-3xl border border-border bg-card/20 p-6 flex flex-col min-h-[400px] max-h-[calc(100vh-140px)]">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Scan History</h2>
            
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {scanLogs.length === 0 ? (
              <div className="text-center text-muted-foreground text-xs py-12 border border-dashed border-border rounded-xl">
                No tickets scanned.
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
                  
                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground/70 truncate">{log.code}</span>
                      <span className="text-[9px] text-muted-foreground shrink-0">{log.time}</span>
                    </div>
                    {log.student && (
                      <p className="font-semibold text-sm">
                        {log.student} <span className="opacity-70 font-mono text-xs ml-1">{log.roll}</span>
                      </p>
                    )}
                    <p className="text-[11px] leading-snug opacity-90">{log.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

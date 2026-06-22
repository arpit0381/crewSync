"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme as useNextTheme } from "next-themes"
import { useTheme, type ThemePack } from "@/components/theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  Palette,
  Trophy,
  Laptop,
  CheckCircle2,
  QrCode,
  Download,
  ChevronRight,
  Activity,
  UserCheck,
  Users2,
  Sparkles,
  Search,
  Filter,
  Flame,
  Zap,
  BarChart3,
  Loader2,
  ChevronDown,
  Building,
  Check,
  Cpu,
  Clock,
  Compass
} from "lucide-react"

// Types
interface Event {
  id: string
  title: string
  description: string
  banner_url?: string | null
  venue: string
  event_date: string
  event_time: string
  capacity: number
  reg_type: "individual" | "team"
  categories?: { name: string; type: string } | null
}

interface LandingClientProps {
  events: Event[]
}

// Simple Counter Component for stats
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = React.useState(0)
  const elementRef = React.useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = React.useState(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  React.useEffect(() => {
    if (!hasAnimated) return

    let start = 0
    const end = value
    const duration = 1.5 // seconds
    const totalMiliseconds = duration * 1000
    const startTime = performance.now()

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / totalMiliseconds, 1)
      
      // easeOutExpo easing
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setCount(Math.floor(ease * (end - start) + start))
      
      if (progress < 1) {
        requestAnimationFrame(updateCount)
      }
    }
    
    requestAnimationFrame(updateCount)
  }, [value, hasAnimated])

  return (
    <div ref={elementRef} className="font-extrabold tracking-tight text-3xl sm:text-5xl text-foreground">
      {count.toLocaleString()}{suffix}
    </div>
  )
}

export function LandingClient({ events }: LandingClientProps) {
  const { setTheme, resolvedTheme } = useNextTheme()
  const { themePack, setThemePack } = useTheme()
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // Interactive Live Preview State
  const [previewTab, setPreviewTab] = React.useState<"hackathon" | "brackets" | "scanner" | "certificates">("hackathon")

  // Category selection for Event Discovery
  const [activeCategory, setActiveCategory] = React.useState<string>("All")

  // Interactive Hackathon Form Mock State
  const [hackathonStep, setHackathonStep] = React.useState<"form" | "loading" | "success">("form")
  const [hackathonTeam, setHackathonTeam] = React.useState("Byte Busters")
  const [hackathonProject, setHackathonProject] = React.useState("CrewSync Attendance Bot")
  const [hackathonRepo, setHackathonRepo] = React.useState("https://github.com/crewarena/crewsync")

  // Interactive Bracket Match State
  const [selectedMatch, setSelectedMatch] = React.useState<{ id: number; team1: string; score1: number; team2: string; score2: number; round: string } | null>(null)

  // Interactive Attendance Flow step state
  const [activeAttendanceStep, setActiveAttendanceStep] = React.useState(1)

  // Interactive Certificate state
  const [certType, setCertType] = React.useState<"winner" | "participation" | "coordinator">("winner")
  const [certGenerating, setCertGenerating] = React.useState(false)
  const [certDone, setCertDone] = React.useState(false)
  const [studentNameInput, setStudentNameInput] = React.useState("Aryan Sharma")
  const [certNumber, setCertNumber] = React.useState<number>(838483)

  React.useEffect(() => {
    setMounted(true)
    setCertNumber(Math.floor(Math.random() * 900000 + 100000))
  }, [])

  // Close dropdown on Escape
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

  // Bracket matches for BGMI Tournament
  const bracketMatches = [
    { id: 1, team1: "GodLike Esports", score1: 15, team2: "Entity Gaming", score2: 12, round: "Quarterfinal 1", status: "finished" },
    { id: 2, team1: "Team Soul", score1: 18, team2: "Reckoning Esports", score2: 14, round: "Quarterfinal 2", status: "finished" },
    { id: 3, team1: "Global Esports", score1: 16, team2: "Team XSpark", score2: 17, round: "Quarterfinal 3", status: "finished" },
    { id: 4, team1: "Orangutan Gaming", score1: 11, team2: "Blind Esports", score2: 13, round: "Quarterfinal 4", status: "finished" },
    { id: 5, team1: "GodLike Esports", score1: 14, team2: "Team Soul", score2: 16, round: "Semifinal 1", status: "finished" },
    { id: 6, team1: "Team XSpark", score1: 15, team2: "Blind Esports", score2: 12, round: "Semifinal 2", status: "finished" },
    { id: 7, team1: "Team Soul", score1: 22, team2: "Team XSpark", score2: 19, round: "Grand Final", status: "finished" }
  ]

  // Leaderboard statistics for battlefy simulation
  const teamStandings = [
    { rank: 1, name: "Team Soul", matches: 3, points: 56, logo: "S" },
    { rank: 2, name: "Team XSpark", matches: 3, points: 51, logo: "X" },
    { rank: 3, name: "GodLike Esports", matches: 2, points: 29, logo: "G" },
    { rank: 4, name: "Blind Esports", matches: 2, points: 25, logo: "B" },
    { rank: 5, name: "Global Esports", matches: 1, points: 16, logo: "GE" }
  ]

  // Fallback high fidelity events if Supabase table is empty
  const fallbackEvents: Event[] = [
    {
      id: "mock-1",
      title: "Crew Hackathon 2026",
      description: "Build tools to optimize student engagement, simplify event check-ins, or manage esports tournaments. Win from a pool of INR 50,000.",
      venue: "Main Auditorium & CSE Lab",
      event_date: "2026-07-15",
      event_time: "09:00 AM",
      capacity: 120,
      reg_type: "team",
      categories: { name: "Hackathon", type: "academic" }
    },
    {
      id: "mock-2",
      title: "BGMI Campus Showdown",
      description: "Battle it out against the top squads on Erangel and Miramar. Streamed live with official commentators.",
      venue: "Seminar Hall A / Online",
      event_date: "2026-07-20",
      event_time: "02:00 PM",
      capacity: 200,
      reg_type: "team",
      categories: { name: "Esports", type: "gaming" }
    },
    {
      id: "mock-3",
      title: "Inter-Department Football Championship",
      description: "The ultimate 7-v-7 football tournament where departments lock horns for absolute glory and the trophy.",
      venue: "Main Sports Arena",
      event_date: "2026-08-02",
      event_time: "04:00 PM",
      capacity: 64,
      reg_type: "team",
      categories: { name: "Sports", type: "sports" }
    },
    {
      id: "mock-4",
      title: "Generative AI Masterclass",
      description: "Hands-on workshop on building applications with LLMs, prompt engineering, and deploying agentic workflows.",
      venue: "Virtual Classroom 101",
      event_date: "2026-07-10",
      event_time: "10:30 AM",
      capacity: 500,
      reg_type: "individual",
      categories: { name: "Workshop", type: "academic" }
    },
    {
      id: "mock-5",
      title: "TEDx Crew Campus",
      description: "Ideas worth spreading. Faculty and external tech leaders share insights on the future of decentralization, VR, and quantum systems.",
      venue: "OAT (Open Air Theatre)",
      event_date: "2026-08-10",
      event_time: "05:30 PM",
      capacity: 350,
      reg_type: "individual",
      categories: { name: "Seminar", type: "academic" }
    }
  ]

  const displayEvents = events.length > 0 ? events : fallbackEvents

  const categories = ["All", "Hackathon", "Esports", "Sports", "Workshop", "Seminar"]

  const filteredEvents = activeCategory === "All"
    ? displayEvents
    : displayEvents.filter(e => e.categories?.name === activeCategory || e.title.toLowerCase().includes(activeCategory.toLowerCase()))

  const handleHackathonSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHackathonStep("loading")
    setTimeout(() => {
      setHackathonStep("success")
    }, 2000)
  }

  const handleCertDownload = () => {
    setCertGenerating(true)
    setTimeout(() => {
      setCertGenerating(false)
      setCertDone(true)
      // trigger small text download to simulate file
      const element = document.createElement("a");
      const file = new Blob([
        `Crew Arena Secure Certificate\nRecipient: ${studentNameInput}\nType: ${certType.toUpperCase()}\nVerification Hash: ca_cert_${Math.random().toString(36).substring(2, 15)}\nDate: 2026-06-22\nAuthorized by Crew Arena Registrar.`
      ], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `crew-arena-${certType}-certificate.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 2500)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground font-sans">
      
      {/* Decorative Radial Grid & Spotlights */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute top-[30%] -right-[15%] w-[60%] h-[60%] bg-violet-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[130px]" />
        <div className="absolute inset-0 grid-bg-mesh opacity-[0.45] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_65%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <header className="flex h-20 items-center justify-between border-b border-border/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-md">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-black tracking-tight">
              CREW<span className="text-primary font-medium ml-1">ARENA</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            <a href="#hero" className="hover:text-primary transition-colors">OS Preview</a>
            <a href="#features" className="hover:text-primary transition-colors">Core Features</a>
            <a href="#discovery" className="hover:text-primary transition-colors">Explore Events</a>
            <a href="#hackathons" className="hover:text-primary transition-colors">Hackathons</a>
            <a href="#sports" className="hover:text-primary transition-colors">Sports & Brackets</a>
            <a href="#attendance" className="hover:text-primary transition-colors">QR Flow</a>
          </nav>

          {/* Theme Settings & Actions */}
          <div className="flex items-center gap-3">
            
            {/* Theme Pack Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold bg-card/50 hover:bg-muted/80 transition-all text-foreground cursor-pointer shadow-sm"
              >
                <Palette className="h-3.5 w-3.5 text-primary" />
                <span className="capitalize hidden sm:inline">{themePack}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-card p-2.5 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Select Theme Accent
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {packs.map((pack) => (
                        <button
                          key={pack.name}
                          onClick={() => {
                            setThemePack(pack.name)
                            setDropdownOpen(false)
                          }}
                          className={`flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium hover:bg-muted/80 transition-all cursor-pointer ${
                            themePack === pack.name ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground border border-transparent"
                          }`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${pack.color} border border-white/20`} />
                          <span className="truncate capitalize">{pack.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dark/Light Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-xl p-2 hover:bg-muted/80 text-foreground transition-all border border-border bg-card/50 cursor-pointer shadow-sm"
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

            {/* CTAs */}
            <Link
              href="/login"
              className="hidden sm:inline-flex text-xs font-bold hover:text-primary transition-colors px-3 py-2 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2.5 rounded-xl shadow-lg shadow-primary/15 hover:scale-[1.02] hover:bg-primary/95 transition-all"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section id="hero" className="py-16 md:py-24 grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>One Arena. Every Event.</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
              The Operating System for
              <span className="block bg-gradient-to-r from-primary via-indigo-400 to-violet-400 bg-clip-text text-transparent mt-1">
                Campus Life
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Manage hackathons, sports brackets, esports standings, automatic QR attendance tracking, credentials, and student analytics on a single, high-fidelity platform.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="#discovery"
                className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
              >
                Explore Events
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold hover:bg-muted/55 transition-all text-foreground"
              >
                Get Started
              </Link>
            </div>

            {/* Key badges */}
            <div className="flex flex-wrap gap-4 pt-6 text-xs text-muted-foreground border-t border-border/60">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Zero paper attendance</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Automated certificates</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Live bracket generators</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border bg-card/45 backdrop-blur-xl shadow-2xl overflow-hidden glass-panel relative group">
              {/* Top Window Accent */}
              <div className="flex items-center justify-between px-4 py-3 bg-card/50 border-b border-border/80">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold px-2 py-0.5 bg-background/50 rounded-lg border border-border/60">
                  <Activity className="h-3 w-3 text-primary animate-pulse" />
                  <span>CREW_SYNC_APP_V2.0</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-border/80 bg-muted/30 overflow-x-auto">
                <button
                  onClick={() => setPreviewTab("hackathon")}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    previewTab === "hackathon"
                      ? "border-primary text-primary bg-background/40"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span>Hackathon Portal</span>
                </button>
                <button
                  onClick={() => setPreviewTab("brackets")}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    previewTab === "brackets"
                      ? "border-primary text-primary bg-background/40"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Esports Brackets</span>
                </button>
                <button
                  onClick={() => setPreviewTab("scanner")}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    previewTab === "scanner"
                      ? "border-primary text-primary bg-background/40"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Live Scanner</span>
                </button>
                <button
                  onClick={() => setPreviewTab("certificates")}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    previewTab === "certificates"
                      ? "border-primary text-primary bg-background/40"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Certificates</span>
                </button>
              </div>

              {/* Tab Content Canvas */}
              <div className="p-5 min-h-[380px] flex flex-col justify-between bg-background/25">
                <AnimatePresence mode="wait">
                  {previewTab === "hackathon" && (
                    <motion.div
                      key="hackathon"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 flex-1 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase">
                            Accepting Submissions
                          </span>
                          <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Ends in 04:32:15
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Smart India Hackathon (Local Hub)</h3>
                        <p className="text-xs text-muted-foreground">
                          Prototype solutions addressing local transport optimization, energy saving, and student safety tools.
                        </p>
                      </div>

                      {/* Mock Devfolio submit block */}
                      <div className="bg-card/60 rounded-2xl border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
                          <span className="font-semibold text-muted-foreground">Project Registration</span>
                          <span className="text-primary font-bold">Step 2 of 3</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">Team Name</span>
                            <p className="font-bold text-foreground">Byte Busters</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">Track</span>
                            <p className="font-bold text-foreground">Next-Gen SaaS</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary rounded-full w-2/3" />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">66%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-muted-foreground font-bold">Submitted Teams: 42</span>
                        <Link href="/register" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                          Access Hackathon Portal <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {previewTab === "brackets" && (
                    <motion.div
                      key="brackets"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 flex-1 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-bold text-foreground">BGMI Arena Championship</h3>
                          <p className="text-[10px] text-muted-foreground">Live bracket results and round details</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 uppercase">
                          Grand Finals
                        </span>
                      </div>

                      {/* Mock Bracket Visual */}
                      <div className="grid grid-cols-3 gap-2 items-center bg-card/30 p-3 rounded-2xl border border-border/50 text-[11px]">
                        {/* Round 1 */}
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase text-muted-foreground font-bold">Semifinal</span>
                          <div className="bg-card p-1.5 rounded-xl border border-border space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span>GodLike</span>
                              <span>14</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Soul</span>
                              <span className="font-bold text-primary">16</span>
                            </div>
                          </div>
                        </div>

                        {/* Connection visual */}
                        <div className="flex items-center justify-center">
                          <svg className="w-full h-8 text-primary" viewBox="0 0 100 40" fill="none">
                            <path d="M0 10 H50 V30 H100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
                            <path d="M0 30 H50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
                          </svg>
                        </div>

                        {/* Finalist */}
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase text-muted-foreground font-bold">Champion</span>
                          <div className="bg-primary/10 p-2 rounded-xl border border-primary/30 space-y-1 text-center">
                            <Trophy className="h-4 w-4 text-primary mx-auto" />
                            <p className="font-bold text-primary text-xs">Team Soul</p>
                            <span className="text-[8px] text-muted-foreground uppercase font-bold">56 Total Pts</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-[11px] text-muted-foreground font-bold">Matches Completed: 12/13</span>
                        <Link href="#sports" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                          View Interactive Brackets <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {previewTab === "scanner" && (
                    <motion.div
                      key="scanner"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 flex-1 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-bold text-foreground">QR Attendance Scanner</h3>
                          <p className="text-[10px] text-muted-foreground">Mobile verification endpoint dashboard</p>
                        </div>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                          Live Scanning
                        </span>
                      </div>

                      {/* Mock Scanner Feed & Log */}
                      <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="aspect-square bg-zinc-950 rounded-2xl border border-border flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-4 border border-dashed border-primary/50 rounded-xl" />
                          <QrCode className="h-16 w-16 text-primary animate-pulse" />
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/80 animate-bounce" />
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase text-muted-foreground font-bold">Check-In Logs</span>
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto text-[10px]">
                            <div className="flex items-center justify-between p-1 bg-card rounded-lg border border-border">
                              <span className="font-bold">Rohan Sen</span>
                              <span className="text-emerald-400">Verified</span>
                            </div>
                            <div className="flex items-center justify-between p-1 bg-card rounded-lg border border-border">
                              <span className="font-bold">Esha Patel</span>
                              <span className="text-emerald-400">Verified</span>
                            </div>
                            <div className="flex items-center justify-between p-1 bg-card rounded-lg border border-border">
                              <span className="font-bold">Vijay Kumar</span>
                              <span className="text-emerald-400">Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-muted-foreground font-bold">Scanned: 184 Students</span>
                        <Link href="#attendance" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                          Verify Scanner Flow <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {previewTab === "certificates" && (
                    <motion.div
                      key="certificates"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 flex-1 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-bold text-foreground">Credential Verification</h3>
                          <p className="text-[10px] text-muted-foreground">Encrypted, verifiable PDF certificates</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase">
                          Cryptographic Sign
                        </span>
                      </div>

                      {/* Mock Certificate Visual */}
                      <div className="bg-card/80 border border-border p-4 rounded-2xl relative flex items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-[9px] uppercase tracking-widest font-black">Crew Arena Certified</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">Aryan Sharma</h4>
                            <p className="text-[9px] text-muted-foreground">Winner - BGMI Esports Championship 2026</p>
                          </div>
                          <span className="text-[8px] text-muted-foreground block font-mono">HASH: 7C8C...B765</span>
                        </div>
                        <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                          <QrCode className="h-full w-full text-zinc-950" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-muted-foreground font-bold">Secured: SHA-256</span>
                        <Link href="#certificate-section" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                          Try Certificate Customizer <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Section */}
        <section className="py-12 border-y border-border/80 bg-card/10 rounded-[2.5rem] px-6 my-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div className="space-y-1">
              <AnimatedCounter value={10000} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Students engaged</p>
            </div>
            <div className="space-y-1 border-l border-border/80 md:border-l-0">
              <AnimatedCounter value={500} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Events Managed</p>
            </div>
            <div className="space-y-1 border-t border-border/80 md:border-t-0 md:border-l border-border/80 pt-6 md:pt-0">
              <AnimatedCounter value={50} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Clubs</p>
            </div>
            <div className="space-y-1 border-t border-border/80 md:border-t-0 md:border-l border-border/80 pt-6 md:pt-0">
              <AnimatedCounter value={20} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Departments</p>
            </div>
            <div className="space-y-1 border-t border-border/80 md:border-t-0 md:border-l border-border/80 pt-6 md:pt-0 col-span-2 md:col-span-1">
              <AnimatedCounter value={100000} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registrations</p>
            </div>
          </div>
        </section>

        {/* Feature Showcase Grid */}
        <section id="features" className="py-16 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered for the Modern Campus
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Everything required to scale student activities, verify attendances, host multi-stage tournaments, and automate administrative overhead.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Feature 1 */}
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Event Management</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Design complex workflows, manage venues, set custom limits, and coordinate department activities seamlessly.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <QrCode className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">QR Attendance</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fast attendance capture at venues. Generates unique secure QR tickets for students, scanned instantly by organizers.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Laptop className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Hackathons</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Devfolio-inspired project workspace with automated registration, repository submission, and review pipelines.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Sports & Leagues</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Interactive fixture systems, tournament schedules, point charts, and department leaderboards.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Flame className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Esports Arena</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Official tournament cards, custom lobbies, credentials broadcasting, live scoreboard trackers, and bracket routes.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Secured Certificates</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate digital verification credentials signed by coordinators, instantly downloadable once check-in conditions are met.
                </p>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Activity Analytics</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Examine attendance rates, club registrations growth, coordinate department performance, and student engagement graphs.
                </p>
              </div>
            </div>

            {/* Feature 8 */}
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 flex flex-col justify-between hover:border-primary/40 transition-all hover:scale-[1.02] duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Users2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Team Registrations</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Form virtual crews, generate invite-only team links, lock sizes, and register groups seamlessly for collective tasks.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Event Discovery Section */}
        <section id="discovery" className="py-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Active Campus Events Explorer</h2>
              <p className="text-sm text-muted-foreground">Find upcoming workshops, hackathons, and sports matches. Sort by category.</p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}s
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-border bg-card/10">
                <p className="text-muted-foreground font-semibold">No active events found for this category.</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const categoryName = event.categories?.name || "Campus Event"
                return (
                  <div
                    key={event.id}
                    className="flex flex-col rounded-3xl border border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group shadow-md"
                  >
                    {/* Visual Banner */}
                    <div className="h-44 w-full relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                      {event.banner_url ? (
                        <Image
                          src={event.banner_url}
                          alt={event.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-violet-500/5 flex items-center justify-center">
                          <Compass className="h-10 w-10 text-primary/40 animate-pulse" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-background/20" />
                      <span className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                        {categoryName}
                      </span>
                    </div>

                    <div className="p-6 flex flex-1 flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{event.event_date} at {event.event_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="inline-flex items-center gap-1 font-bold text-foreground">
                            <Users className="h-3 w-3 text-primary" /> {event.reg_type === "team" ? "Team event" : "Individual"}
                          </span>
                          <span>Max Cap: {event.capacity}</span>
                        </div>
                      </div>

                      <Link
                        href={`/events/${event.id}`}
                        className="w-full mt-2 flex items-center justify-center gap-1 rounded-xl bg-card hover:bg-primary hover:text-primary-foreground py-2.5 text-xs font-bold transition-all border border-border hover:border-primary text-foreground"
                      >
                        Join Event & Register
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Hackathon Portal Section (Devfolio Inspired) */}
        <section id="hackathons" className="py-16 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-bold text-emerald-400">
              <Laptop className="h-3.5 w-3.5" />
              <span>Devfolio Inspired Workspace</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Hackathon Center</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Form cross-functional teams, push code repositories, track project approvals, and present to judges in real-time.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            {/* Submission workflow stats */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-card/10 rounded-3xl border border-border/80 p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">How Submissions Work</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Students register directly, build teams inside the app, import GitHub repos, and upload pitch files. The panel of judges receives immediate notification to scoring sheets.
                </p>

                <div className="space-y-3.5">
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                    <div>
                      <h4 className="text-xs font-bold">Team Invitation Link</h4>
                      <p className="text-[11px] text-muted-foreground">Generate security tokens for crew members.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                    <div>
                      <h4 className="text-xs font-bold">Build & Sync Repository</h4>
                      <p className="text-[11px] text-muted-foreground">Deploy codes, verify repository licenses.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                    <div>
                      <h4 className="text-xs font-bold">Encrypted Submission</h4>
                      <p className="text-[11px] text-muted-foreground">Send pitch documents to scoring algorithms.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Devfolio Style Stat Bar */}
              <div className="pt-4 border-t border-border/60 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-lg font-extrabold text-primary">5,432</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Commits Synced</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-primary">124</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Teams Registered</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-primary">32</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Mentors Live</p>
                </div>
              </div>
            </div>

            {/* Interactive Hackathon Submission Mock */}
            <div className="lg:col-span-7 rounded-3xl border border-border bg-card/25 p-6 glass-panel relative flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Submission Console</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  DEVFOLIO_SYNC: ON
                </span>
              </div>

              <AnimatePresence mode="wait">
                {hackathonStep === "form" && (
                  <motion.form
                    key="form"
                    onSubmit={handleHackathonSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 flex-1 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Team Name</label>
                        <input
                          type="text"
                          required
                          value={hackathonTeam}
                          onChange={(e) => setHackathonTeam(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Project Title</label>
                        <input
                          type="text"
                          required
                          value={hackathonProject}
                          onChange={(e) => setHackathonProject(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">GitHub Repository URL</label>
                        <input
                          type="url"
                          required
                          value={hackathonRepo}
                          onChange={(e) => setHackathonRepo(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 bg-primary text-primary-foreground font-bold text-xs py-3 rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Submit Project to Jury
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </motion.form>
                )}

                {hackathonStep === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center py-8 space-y-4"
                  >
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-foreground">Packaging Submission Repository</p>
                      <p className="text-[10px] text-muted-foreground">Verifying branch status & pushing metadata...</p>
                    </div>
                  </motion.div>
                )}

                {hackathonStep === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between py-2"
                  >
                    <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Check className="h-6 w-6 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground">Project Submitted Successfully!</h4>
                        <p className="text-[10px] text-muted-foreground">Jury notified. Transaction receipt created.</p>
                      </div>
                    </div>

                    <div className="bg-background rounded-2xl border border-border p-3 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">JURY_STATUS:</span> <span className="text-emerald-400 font-bold">QUEUED</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">TEAM:</span> <span>{hackathonTeam}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">PROJECT:</span> <span>{hackathonProject}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">REPO:</span> <span className="truncate max-w-[180px]">{hackathonRepo}</span></div>
                    </div>

                    <button
                      onClick={() => setHackathonStep("form")}
                      className="w-full mt-4 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs py-2 rounded-xl border border-border cursor-pointer transition-colors"
                    >
                      Reset Submission Simulator
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Sports & Esports Section (Battlefy Inspired) */}
        <section id="sports" className="py-16 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-bold text-amber-400">
              <Trophy className="h-3.5 w-3.5" />
              <span>Battlefy Inspired Brackets</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Sports & Esports Hub</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Automatic bracket routing, department-based leaderboards, and game credentials broadcasting.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            {/* Interactive Tournament Bracket */}
            <div className="lg:col-span-8 rounded-3xl border border-border bg-card/20 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-6">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-foreground">Interactive Tournament Bracket</h3>
                  <p className="text-[10px] text-muted-foreground">Click matches to highlight connections</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20 uppercase">
                    BGMI Playoffs
                  </span>
                </div>
              </div>

              {/* Bracket Tree Layout */}
              <div className="grid grid-cols-3 gap-3 items-center min-h-[220px]">
                
                {/* Column 1: Quarterfinals */}
                <div className="space-y-4">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block border-b border-border/40 pb-1">Quarterfinal</span>
                  <div
                    onClick={() => setSelectedMatch(bracketMatches[0])}
                    className={`p-2 rounded-xl border transition-all cursor-pointer text-[10px] space-y-1 ${
                      selectedMatch?.id === 1 ? "border-primary bg-primary/5 shadow-md shadow-primary/5" : "border-border bg-card/50 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex justify-between font-semibold">
                      <span>GodLike</span>
                      <span>15</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Entity</span>
                      <span>12</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedMatch(bracketMatches[1])}
                    className={`p-2 rounded-xl border transition-all cursor-pointer text-[10px] space-y-1 ${
                      selectedMatch?.id === 2 ? "border-primary bg-primary/5 shadow-md shadow-primary/5" : "border-border bg-card/50 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex justify-between font-semibold">
                      <span>Soul</span>
                      <span>18</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Reckoning</span>
                      <span>14</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Semifinal */}
                <div className="space-y-8">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block border-b border-border/40 pb-1">Semifinal</span>
                  <div
                    onClick={() => setSelectedMatch(bracketMatches[4])}
                    className={`p-2 rounded-xl border transition-all cursor-pointer text-[10px] space-y-1 ${
                      selectedMatch?.id === 5 ? "border-primary bg-primary/5 shadow-md shadow-primary/5" : "border-border bg-card/50 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex justify-between text-muted-foreground">
                      <span>GodLike</span>
                      <span>14</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Soul</span>
                      <span>16</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Finals */}
                <div className="space-y-12">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block border-b border-border/40 pb-1">Grand Final</span>
                  <div
                    onClick={() => setSelectedMatch(bracketMatches[6])}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-[10px] space-y-1 text-center bg-primary/5 ${
                      selectedMatch?.id === 7 ? "border-primary bg-primary/10 shadow-md" : "border-primary/30 hover:border-primary"
                    }`}
                  >
                    <Trophy className="h-4 w-4 text-primary mx-auto mb-1 animate-pulse" />
                    <p className="font-bold text-foreground">Team Soul</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Champions (22-19)</p>
                  </div>
                </div>

              </div>

              {/* Match Inspect Modal Overlay */}
              <AnimatePresence>
                {selectedMatch && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="mt-4 p-3 bg-muted/50 rounded-2xl border border-border flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-primary block">{selectedMatch.round} Summary</span>
                      <p className="font-bold">
                        {selectedMatch.team1} ({selectedMatch.score1}) vs {selectedMatch.team2} ({selectedMatch.score2})
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedMatch(null)}
                      className="px-2 py-1 rounded bg-card hover:bg-muted text-[10px] border border-border cursor-pointer transition-colors"
                    >
                      Close Summary
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Battlefy Leaderboard Standings */}
            <div className="lg:col-span-4 rounded-3xl border border-border bg-card/10 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground">League Rankings</h3>
                  <p className="text-[10px] text-muted-foreground">Top squads based on overall tournament points</p>
                </div>

                <div className="space-y-2">
                  {teamStandings.map((team) => (
                    <div key={team.rank} className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60 hover:border-primary/20 transition-all text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-muted-foreground w-4 text-center">{team.rank}</span>
                        <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-[10px]">
                          {team.logo}
                        </div>
                        <span className="font-semibold">{team.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{team.points} pts</p>
                        <p className="text-[8px] text-muted-foreground">{team.matches} played</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 text-center">
                <Link href="/register" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
                  Join Free Fire & BGMI Lobbies <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* QR Attendance Section */}
        <section id="attendance" className="py-16 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
              <QrCode className="h-3.5 w-3.5" />
              <span>End-to-End Visual Loop</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">QR Attendance Flow</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Automated offline check-ins. Read the flow path from event claim to credential unlocking.
            </p>
          </div>

          {/* Interactive Connective Flow */}
          <div className="grid gap-6 md:grid-cols-5 items-stretch relative">
            
            {/* Step 1 */}
            <div
              onClick={() => setActiveAttendanceStep(1)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                activeAttendanceStep === 1 ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border bg-card/20 hover:border-primary/20"
              }`}
            >
              <span className="text-[10px] font-bold text-primary uppercase">Step 01</span>
              <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Register Online</h4>
                <p className="text-[11px] text-muted-foreground mt-1">Claim your seat on our public page catalog.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setActiveAttendanceStep(2)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                activeAttendanceStep === 2 ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border bg-card/20 hover:border-primary/20"
              }`}
            >
              <span className="text-[10px] font-bold text-primary uppercase">Step 02</span>
              <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Get Ticket QR</h4>
                <p className="text-[11px] text-muted-foreground mt-1">Instant, cryptographically unique event ticket.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setActiveAttendanceStep(3)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                activeAttendanceStep === 3 ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border bg-card/20 hover:border-primary/20"
              }`}
            >
              <span className="text-[10px] font-bold text-primary uppercase">Step 03</span>
              <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Scan at Venue</h4>
                <p className="text-[11px] text-muted-foreground mt-1">Organizer scans ticket for instant verification.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setActiveAttendanceStep(4)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                activeAttendanceStep === 4 ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border bg-card/20 hover:border-primary/20"
              }`}
            >
              <span className="text-[10px] font-bold text-primary uppercase">Step 04</span>
              <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Attendance Marked</h4>
                <p className="text-[11px] text-muted-foreground mt-1">System saves check-in date, time, and device logs.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div
              onClick={() => setActiveAttendanceStep(5)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                activeAttendanceStep === 5 ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border bg-card/20 hover:border-primary/20"
              }`}
            >
              <span className="text-[10px] font-bold text-primary uppercase">Step 05</span>
              <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Cert unlocked</h4>
                <p className="text-[11px] text-muted-foreground mt-1">Automatic verification and download credentials unlocked.</p>
              </div>
            </div>

          </div>

          {/* Interactive Description of current step */}
          <div className="bg-card/40 border border-border rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Flow Details</span>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {activeAttendanceStep === 1 && "Start by exploring the active events dashboard. Register for any event using individual credentials or team tokens. The registration is immediately written to Supabase tables."}
                {activeAttendanceStep === 2 && "Once registration is successful, the app generates a ticket. It uses unique hash mechanisms containing user, team, and event IDs to compile the QR image."}
                {activeAttendanceStep === 3 && "At the sports field or workshop hall, presentation coordinators use the integrated mobile attendance camera scanner to decrypt your ticket QR."}
                {activeAttendanceStep === 4 && "The system validates the QR token. Upon approval, it writes attendance timestamp records and changes check-in status from pending to verified."}
                {activeAttendanceStep === 5 && "Verified attendance validates student coordinates. This triggers automated digital signatures, unlocking a high-resolution certificate for instant download."}
              </p>
            </div>
            <button
              onClick={() => setActiveAttendanceStep(prev => prev < 5 ? prev + 1 : 1)}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              Next Step {activeAttendanceStep === 5 ? "(Reset)" : ""}
            </button>
          </div>
        </section>

        {/* Certificate Customizer Section */}
        <section id="certificate-section" className="py-16 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/5 px-3 py-1 text-xs font-bold text-violet-400">
              <Award className="h-3.5 w-3.5" />
              <span>Verifiable Security</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Verifiable PDF Certificates</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Automated credentials generated instantly upon event check-in validation. Test the download experience.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            {/* Customizer Panel */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-card/20 rounded-3xl border border-border/80 p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">Configure Sandbox Preview</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Student Name</label>
                    <input
                      type="text"
                      value={studentNameInput}
                      onChange={(e) => setStudentNameInput(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Certificate Template</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => { setCertType("winner"); setCertDone(false); }}
                        className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                          certType === "winner" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                        }`}
                      >
                        🏆 Winner
                      </button>
                      <button
                        onClick={() => { setCertType("participation"); setCertDone(false); }}
                        className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                          certType === "participation" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                        }`}
                      >
                        🤝 Participant
                      </button>
                      <button
                        onClick={() => { setCertType("coordinator"); setCertDone(false); }}
                        className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                          certType === "coordinator" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                        }`}
                      >
                        ⚡ Volunteer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  disabled={certGenerating}
                  onClick={handleCertDownload}
                  className="w-full bg-primary text-primary-foreground font-bold text-xs py-3 rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {certGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Signing Digital Assets...
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Download Verification PDF
                    </>
                  )}
                </button>
                {certDone && (
                  <p className="text-[10px] text-center text-emerald-400 font-bold animate-pulse">
                    ✓ Certificate file generated & pushed to local disk!
                  </p>
                )}
              </div>
            </div>

            {/* Live Certificate Card Rendering */}
            <div className="lg:col-span-7 rounded-3xl border border-border bg-card/25 p-8 relative flex flex-col justify-between overflow-hidden shadow-2xl glass-panel">
              {/* Decorative glows */}
              <div className="absolute -top-12 -right-12 h-32 w-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl" />

              <div className="border border-border/80 p-6 rounded-2xl flex flex-col justify-between flex-1 space-y-6 relative z-10 min-h-[220px]">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-foreground">Crew Arena Registrar</span>
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground">CRT_NO: {certNumber}</span>
                </div>

                <div className="space-y-2 text-center py-2">
                  <span className="text-[9px] uppercase tracking-widest font-black text-primary">Certificate of Excellence</span>
                  <h3 className="text-xl font-black text-foreground tracking-tight">{studentNameInput || "Your Name Here"}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {certType === "winner" && "For securing the 1st Rank position at the Crew Campus Esports & Hackathon playoffs, demonstrating outstanding development skill and technical efficiency."}
                    {certType === "participation" && "For active, verified participation in the collaborative workshops and campus activities, validating attendance and check-in benchmarks."}
                    {certType === "coordinator" && "For rendering excellent volunteer efforts as a student group leader, coordinating venues, scanning check-ins, and assisting attendees."}
                  </p>
                </div>

                <div className="flex items-end justify-between border-t border-border/60 pt-4 text-[9px] text-muted-foreground font-semibold">
                  <div>
                    <p className="text-foreground">Dr. Alok Vardhan</p>
                    <span className="text-[8px]">Dean, Student Activity Council</span>
                  </div>
                  
                  <div className="h-10 w-10 bg-white p-0.5 rounded border border-border flex items-center justify-center shrink-0">
                    <QrCode className="h-full w-full text-zinc-950" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Coordinate Grid */}
        <section className="py-16 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">Trusted by Leading Organizations & Faculty</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Collaborated across college councils, technical clubs, and sports boards.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-2xl border border-border bg-card/25 flex flex-col items-center justify-center space-y-2">
              <Building className="h-6 w-6 text-primary" />
              <p className="text-xs font-bold text-foreground">Computer Science Dept</p>
              <span className="text-[9px] text-muted-foreground uppercase font-bold">12 Active Clubs</span>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card/25 flex flex-col items-center justify-center space-y-2">
              <Cpu className="h-6 w-6 text-primary" />
              <p className="text-xs font-bold text-foreground">Google Developer Group</p>
              <span className="text-[9px] text-muted-foreground uppercase font-bold">Tech Hackathons</span>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card/25 flex flex-col items-center justify-center space-y-2">
              <Trophy className="h-6 w-6 text-primary" />
              <p className="text-xs font-bold text-foreground">Sports Council Board</p>
              <span className="text-[9px] text-muted-foreground uppercase font-bold">Athletic Playoffs</span>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card/25 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6 text-primary" />
              <p className="text-xs font-bold text-foreground">Student Welfare SAC</p>
              <span className="text-[9px] text-muted-foreground uppercase font-bold">Campus Coordination</span>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">What the Campus Says</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Read reviews from active developers, coordinators, and directors.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-3xl border border-border bg-card/20 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "Crew Arena completely eliminated the Google Sheets mess we had for hackathons. Teams formed and registered in seconds, and we tracked submissions in real-time."
              </p>
              <div>
                <h4 className="text-xs font-bold text-foreground">Kabir Roy</h4>
                <p className="text-[9px] text-muted-foreground">GDG Lead / Student Organizer</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card/20 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "Scanning tickets at the sports gate was seamless. We marked attendance for 400+ participants within 15 minutes, and their certificates generated automatically."
              </p>
              <div>
                <h4 className="text-xs font-bold text-foreground">Preeti Nair</h4>
                <p className="text-[9px] text-muted-foreground">Sports Coordinator</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card/20 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "As an administrator, the department-wide engagement insights are invaluable. Crew Arena provides clear transparency into student activity parameters."
              </p>
              <div>
                <h4 className="text-xs font-bold text-foreground">Prof. S. R. Sen</h4>
                <p className="text-[9px] text-muted-foreground">Faculty Convener / Dean Student Affairs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 my-8">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-violet-500/5 p-8 md:p-12 text-center relative overflow-hidden flex flex-col items-center justify-center space-y-6">
            <div className="absolute inset-0 z-0 pointer-events-none bg-radial-[circle_at_center,transparent_40%,var(--background)] opacity-60" />
            
            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to transform your campus events?</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                Join thousands of students and organizers. Deploy tournament brackets, scanner apps, and certificate engines.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-primary text-primary-foreground font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] hover:bg-primary/95 transition-all"
              >
                Start Organizing
              </Link>
              <Link
                href="#discovery"
                className="w-full sm:w-auto border border-border bg-card/80 px-6 py-3.5 text-xs font-semibold hover:bg-muted/80 rounded-xl transition-all"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/80 py-12 text-xs text-muted-foreground">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">Crew Arena</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The comprehensive campus event and tournament operating system.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-[11px] uppercase tracking-wider">Features</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="#discovery" className="hover:text-primary transition-colors">Event Explorer</Link></li>
                <li><Link href="#hackathons" className="hover:text-primary transition-colors">Hackathon Desk</Link></li>
                <li><Link href="#sports" className="hover:text-primary transition-colors">Sports Brackets</Link></li>
                <li><Link href="#attendance" className="hover:text-primary transition-colors">QR Scanning Flow</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-[11px] uppercase tracking-wider">Resources</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="#certificate-section" className="hover:text-primary transition-colors">Certificate Verify</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Join Portal</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-[11px] uppercase tracking-wider">Contact & About</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="mailto:support@crewarena.edu" className="hover:text-primary transition-colors">support@crewarena.edu</a></li>
                <li><span className="block">Student Welfare Center, Main Campus</span></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/60 pt-6 gap-4">
            <p>© {new Date().getFullYear()} Crew Arena. Designed for premium campus engagement.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

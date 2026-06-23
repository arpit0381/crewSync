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

  // Upcoming Events Carousel State
  const [currentSlide, setCurrentSlide] = React.useState(0)

  // Category selection for Event Discovery
  const [activeCategory, setActiveCategory] = React.useState<string>("All")

  // Interactive Attendance Flow step state
  const [activeAttendanceStep, setActiveAttendanceStep] = React.useState(1)

  // Interactive Certificate state
  const [certType, setCertType] = React.useState<"winner" | "participation" | "coordinator">("winner")
  const [certGenerating, setCertGenerating] = React.useState(false)
  const [certDone, setCertDone] = React.useState(false)
  const [studentNameInput, setStudentNameInput] = React.useState("Aryan Sharma")
  const [certNumber, setCertNumber] = React.useState<number>(838483)

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

  React.useEffect(() => {
    setMounted(true)
    setCertNumber(Math.floor(Math.random() * 900000 + 100000))
  }, [])

  // Auto-rotate the events carousel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev === displayEvents.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [displayEvents.length])

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



  const categories = ["All", "Hackathon", "Esports", "Sports", "Workshop", "Seminar"]

  const filteredEvents = activeCategory === "All"
    ? displayEvents
    : displayEvents.filter(e => e.categories?.name === activeCategory || e.title.toLowerCase().includes(activeCategory.toLowerCase()))

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

          {/* Upcoming Events Carousel */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border bg-card/45 backdrop-blur-xl shadow-2xl overflow-hidden glass-panel relative group h-[480px] flex flex-col">
              {/* Top Window Accent */}
              <div className="flex items-center justify-between px-4 py-3 bg-card/50 border-b border-border/80 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold px-2 py-0.5 bg-background/50 rounded-lg border border-border/60">
                  <Compass className="h-3 w-3 text-primary animate-pulse" />
                  <span>UPCOMING_EVENTS</span>
                </div>
                <div className="w-12 flex justify-end gap-1">
                  <button 
                    onClick={() => setCurrentSlide(prev => (prev === 0 ? displayEvents.length - 1 : prev - 1))}
                    className="p-1 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                  </button>
                  <button 
                    onClick={() => setCurrentSlide(prev => (prev === displayEvents.length - 1 ? 0 : prev + 1))}
                    className="p-1 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Carousel Content */}
              <div className="flex-1 relative overflow-hidden bg-background/25">
                <AnimatePresence mode="wait">
                  {displayEvents.length > 0 && (
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col"
                    >
                      {/* Banner Area */}
                      <div className="relative h-48 w-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center overflow-hidden shrink-0">
                        {displayEvents[currentSlide].banner_url ? (
                          <Image
                            src={displayEvents[currentSlide].banner_url!}
                            alt={displayEvents[currentSlide].title}
                            fill
                            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-background to-violet-500/10 flex items-center justify-center">
                            <Compass className="h-16 w-16 text-primary/30 animate-pulse-slow" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                        <div className="absolute bottom-4 left-6 z-10 flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                            {displayEvents[currentSlide].categories?.name || "Event"}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h3 className="text-2xl font-black text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                            {displayEvents[currentSlide].title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {displayEvents[currentSlide].description}
                          </p>
                        </div>

                        <div className="pt-4 mt-auto border-t border-border/60">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                              <Calendar className="h-4 w-4 text-primary shrink-0" />
                              <span>{displayEvents[currentSlide].event_date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                              <MapPin className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate">{displayEvents[currentSlide].venue}</span>
                            </div>
                          </div>
                          
                          <Link
                            href={`/events/${displayEvents[currentSlide].id}`}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-card hover:bg-primary py-3 text-sm font-bold border border-border hover:border-primary text-foreground hover:text-primary-foreground transition-all shadow-sm hover:shadow-xl hover:shadow-primary/20 cursor-pointer"
                          >
                            Register Now
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                  {displayEvents.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-primary/20"}`}
                    />
                  ))}
                </div>
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

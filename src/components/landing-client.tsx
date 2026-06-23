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



  const categories = ["All", "Hackathon", "Esports", "Sports", "Workshop", "Seminar", "Technical", "Non-Technical", "Cultural", "Guest Lecture"]

  const filteredEvents = activeCategory === "All"
    ? displayEvents
    : displayEvents.filter(e => e.categories?.name === activeCategory || e.title.toLowerCase().includes(activeCategory.toLowerCase()))


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
              Discover & Join
              <span className="block bg-gradient-to-r from-primary via-indigo-400 to-violet-400 bg-clip-text text-transparent mt-1">
                Campus Events
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Explore hackathons, sports championships, esports tournaments, workshops, and exclusive seminars happening right now across the campus.
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
                Create Account
              </Link>
            </div>

            {/* Key badges */}
            <div className="flex flex-wrap gap-4 pt-6 text-xs text-muted-foreground border-t border-border/60">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Instant Registration</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Digital E-Tickets</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Verified Credentials</span>
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
            <div className="space-y-1">
              <AnimatedCounter value={10000} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Students engaged</p>
            </div>
            <div className="space-y-1 border-l border-border/80 md:border-l-0">
              <AnimatedCounter value={500} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Events</p>
            </div>
            <div className="space-y-1 border-t border-border/80 md:border-t-0 md:border-l border-border/80 pt-6 md:pt-0">
              <AnimatedCounter value={50} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campus Clubs</p>
            </div>
            <div className="space-y-1 border-t border-border/80 md:border-t-0 md:border-l border-border/80 pt-6 md:pt-0">
              <AnimatedCounter value={100000} suffix="+" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registrations</p>
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
                  {cat === "All" || cat.endsWith("s") || cat === "Guest Lecture" || cat === "Technical" || cat === "Non-Technical" || cat === "Cultural" ? cat : `${cat}s`}
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
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
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
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to join the action?</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                Join thousands of students discovering and participating in the best campus events.
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
              <h4 className="font-bold text-foreground text-[11px] uppercase tracking-wider">Explore</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="#discovery" className="hover:text-primary transition-colors">Campus Events</Link></li>
                <li><Link href="#discovery" className="hover:text-primary transition-colors">Workshops</Link></li>
                <li><Link href="#discovery" className="hover:text-primary transition-colors">Tournaments</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-[11px] uppercase tracking-wider">Platform</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
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

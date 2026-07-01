"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme as useNextTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rocket,
  Laptop,
  Sparkles,
  Users,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  ArrowLeft,
  ChevronRight,
  X,
  Menu,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"
import { submitContactAction } from "@/app/contact-actions"

interface ContactClientProps {
  userEmail?: string
  userRole?: string
  userName?: string
}

type CategoryType = "collaboration" | "support" | "feedback" | "join" | "general"
type VibeType = "browsing" | "standard" | "urgent"

export function ContactClient({ userEmail, userRole, userName }: ContactClientProps) {
  const { setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Form state
  const [activeCategory, setActiveCategory] = React.useState<CategoryType>("general")
  const [activeVibe, setActiveVibe] = React.useState<VibeType>("standard")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")

  // Status states
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [submittedData, setSubmittedData] = React.useState<{ name: string; email: string; category: string } | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const categoryDetails = {
    collaboration: {
      title: "Collaboration & Partnerships",
      description: "Partner with Crew Sync for events, sponsorships, or integrate our platform with your college department/club systems.",
      placeholderSubject: "E.g., Partnership Inquiry - Tech Fest 2026",
      placeholderMessage: "Hi Crew Sync team, I am the lead coordinator for the upcoming Tech Fest. We would like to collaborate to manage our registrations and attendance...",
      icon: Rocket,
      color: "emerald"
    },
    support: {
      title: "Technical Support",
      description: "Need help with event ticketing, attendance check-in, qr-codes, certificate generation, or tournament brackets?",
      placeholderSubject: "E.g., Issue with QR Code check-in",
      placeholderMessage: "Dear Support, I registered for the Hackathon but my ticket is not showing the QR code correctly on mobile. Here are my registration details...",
      icon: Laptop,
      color: "blue"
    },
    feedback: {
      title: "Feedback & Product Ideas",
      description: "Tell us what features you love, what could be improved, or suggest fresh concepts you would like to see in Crew Sync.",
      placeholderSubject: "E.g., Suggestion for esports bracket scoring",
      placeholderMessage: "I love the brackets view! It would be even better if we could add live game scores directly in the tournament module. Here is my idea...",
      icon: Sparkles,
      color: "violet"
    },
    join: {
      title: "Join the Crew Sync Team",
      description: "Want to contribute to the platform? We look for developers, UI/UX designers, marketing leads, and tournament administrators.",
      placeholderSubject: "E.g., Front-end Developer application",
      placeholderMessage: "Hello, I am a sophomore CSE student specializing in React and Tailwind. I would love to contribute to the tournament brackets interface...",
      icon: Users,
      color: "orange"
    },
    general: {
      title: "General Inquiries",
      description: "Any other queries, campus administrative inquiries, or if you just want to say hi and learn about the platform.",
      placeholderSubject: "E.g., Question about platform features",
      placeholderMessage: "Hello, I wanted to know if Crew Sync is free for all student clubs or if there is a department fee for organizing private tournaments...",
      icon: MessageSquare,
      color: "rose"
    }
  }

  const categoryThemes = {
    collaboration: {
      accent: "text-emerald-400 border-emerald-500/20 focus-within:border-emerald-500 focus-within:ring-emerald-500/20",
      accentButton: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25",
      accentBg: "bg-emerald-500/5 border-emerald-500/20",
      accentGlow: "bg-emerald-500/10",
      accentText: "text-emerald-400",
      accentBorder: "border-emerald-500/30"
    },
    support: {
      accent: "text-blue-400 border-blue-500/20 focus-within:border-blue-500 focus-within:ring-blue-500/20",
      accentButton: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25",
      accentBg: "bg-blue-500/5 border-blue-500/20",
      accentGlow: "bg-blue-500/10",
      accentText: "text-blue-400",
      accentBorder: "border-blue-500/30"
    },
    feedback: {
      accent: "text-violet-400 border-violet-500/20 focus-within:border-violet-500 focus-within:ring-violet-500/20",
      accentButton: "bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/25",
      accentBg: "bg-violet-500/5 border-violet-500/20",
      accentGlow: "bg-violet-500/10",
      accentText: "text-violet-400",
      accentBorder: "border-violet-500/30"
    },
    join: {
      accent: "text-orange-400 border-orange-500/20 focus-within:border-orange-500 focus-within:ring-orange-500/20",
      accentButton: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25",
      accentBg: "bg-orange-500/5 border-orange-500/20",
      accentGlow: "bg-orange-500/10",
      accentText: "text-orange-400",
      accentBorder: "border-orange-500/30"
    },
    general: {
      accent: "text-rose-400 border-rose-500/20 focus-within:border-rose-500 focus-within:ring-rose-500/20",
      accentButton: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25",
      accentBg: "bg-rose-500/5 border-rose-500/20",
      accentGlow: "bg-rose-500/10",
      accentText: "text-rose-400",
      accentBorder: "border-rose-500/30"
    }
  }

  const activeTheme = categoryThemes[activeCategory]
  const activeDetail = categoryDetails[activeCategory]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const res = await submitContactAction({
      name,
      email,
      subject,
      message,
      category: activeCategory,
      vibe: activeVibe
    })

    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setSubmittedData({ name, email, category: activeDetail.title })
      // Clear inputs
      setSubject("")
      setMessage("")
      if (!userEmail) {
        setName("")
        setEmail("")
      }
    }
  }

  const dashboardUrl = React.useMemo(() => {
    if (userRole === "student") return "/student"
    if (userRole === "tournament_admin") return "/tournament"
    if (userRole === "scanner") return "/admin/attendance"
    return "/admin"
  }, [userRole])

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground font-sans">
      
      {/* Decorative Radial Grid & Dynamic Spotlight */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[140px] transition-all duration-1000 ${activeTheme.accentGlow}`} />
        <div className="absolute top-[30%] -right-[15%] w-[60%] h-[60%] bg-violet-500/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 grid-bg-mesh opacity-[0.4] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_65%,transparent_100%)]" />
      </div>

      {/* Floating Navigation Bar */}
      <header className="fixed top-4 left-4 right-4 md:left-6 md:right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-[calc(100%-3rem)] lg:max-w-7xl z-50">
        <div className="rounded-2xl border border-border/50 bg-background/60 backdrop-blur-2xl shadow-xl transition-all duration-300">
          <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-3 cursor-pointer">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-border/30 shadow-md">
                <Image src="/icons/icon-192x192.png" alt="Crew Sync Logo" width={40} height={40} className="object-cover" />
              </div>
              <span className="text-xl font-black tracking-tight">
                CREW<span className="text-primary font-medium ml-1">SYNC</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-muted-foreground">
              <Link href="/#hero" className="hover:text-primary transition-colors">Platform</Link>
              <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="/#discovery" className="hover:text-primary transition-colors">Events</Link>
              <Link href="/#attendance" className="hover:text-primary transition-colors">Check-in</Link>
              <Link href="/contact" className="text-primary transition-colors border-b border-primary/40 pb-0.5">Contact</Link>
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Dark/Light Toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-xl p-2.5 hover:bg-muted/80 text-foreground transition-all border border-border bg-card/50 cursor-pointer shadow-sm"
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

              {/* Desktop CTAs */}
              <div className="hidden md:flex items-center gap-2">
                {userEmail ? (
                  <Link
                    href={dashboardUrl}
                    className="text-xs font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] hover:bg-primary/95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Dashboard <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="text-xs font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-muted/80 transition-colors border border-border bg-card/50 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Content */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-border/50 overflow-hidden bg-background/80 backdrop-blur-xl rounded-b-2xl"
              >
                <div className="p-4 space-y-4">
                  <nav className="flex flex-col gap-2">
                    <Link href="/#hero" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">Platform</Link>
                    <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">Features</Link>
                    <Link href="/#discovery" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">Events</Link>
                    <Link href="/#attendance" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">Check-in</Link>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold rounded-xl bg-primary/10 text-primary transition-colors">Contact</Link>
                  </nav>

                  <div className="pt-4 border-t border-border/50">
                    {userEmail ? (
                      <Link
                        href={dashboardUrl}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-16">
        <div className="grid gap-12 lg:grid-cols-12 items-start mt-6">
          
          {/* Left Column: Mission Details & Quick Contacts */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-36">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Home
              </Link>
              
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] text-foreground">
                Sync with the
                <span className="block bg-gradient-to-r from-primary via-indigo-400 to-violet-400 bg-clip-text text-transparent mt-1">
                  Crew Sync Team
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Choose a category on the form to adapt the submission pipeline. Your query will be directly routed to the right sub-crew for faster resolution.
              </p>
            </div>

            {/* Dynamic Card Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border p-6 shadow-xl relative overflow-hidden transition-all duration-500 ${activeTheme.accentBg}`}
              >
                {/* Glow Spot */}
                <div className={`absolute -right-12 -bottom-12 w-28 h-28 rounded-full blur-2xl ${activeTheme.accentGlow}`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl border border-border flex items-center justify-center bg-card/80 ${activeTheme.accentText}`}>
                      {React.createElement(activeDetail.icon, { className: "h-5 w-5" })}
                    </div>
                    <h2 className="text-lg font-bold text-foreground">
                      {activeDetail.title}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {activeDetail.description}
                  </p>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Multi-Step Interactive Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border/60 bg-card/25 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative">
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Category Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Step 1: Select Your Mission
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {(Object.keys(categoryDetails) as CategoryType[]).map((cat) => {
                      const detail = categoryDetails[cat]
                      const theme = categoryThemes[cat]
                      const isActive = activeCategory === cat
                      const Icon = detail.icon

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setActiveCategory(cat)
                            setErrorMsg(null)
                          }}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 gap-1.5 cursor-pointer ${
                            isActive
                              ? `${theme.accentBg} ${theme.accentBorder} scale-[1.03] shadow-md`
                              : "border-border/60 bg-card/30 text-muted-foreground hover:text-foreground hover:bg-card/75 hover:scale-[1.01]"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? theme.accentText : "opacity-75"}`} />
                          <span className="text-[10px] sm:text-xs font-bold tracking-tight leading-tight">
                            {cat === "collaboration" ? "Partner" : cat === "support" ? "Support" : cat === "feedback" ? "Feedback" : cat === "join" ? "Join Team" : "General"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 space-y-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Step 2: Enter Submissions Details
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className={`flex items-center rounded-xl border bg-background/50 px-4 transition-all ${activeTheme.accent}`}>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="block w-full border-0 bg-transparent py-3 text-sm text-foreground focus:outline-none placeholder-muted-foreground/60"
                        />
                        {name.trim().length > 2 && (
                          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 ml-1.5" />
                        )}
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className={`flex items-center rounded-xl border bg-background/50 px-4 transition-all ${activeTheme.accent}`}>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@college.edu"
                          className="block w-full border-0 bg-transparent py-3 text-sm text-foreground focus:outline-none placeholder-muted-foreground/60"
                        />
                        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 ml-1.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subject input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Subject
                    </label>
                    <div className={`flex items-center rounded-xl border bg-background/50 px-4 transition-all ${activeTheme.accent}`}>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={activeDetail.placeholderSubject}
                        className="block w-full border-0 bg-transparent py-3 text-sm text-foreground focus:outline-none placeholder-muted-foreground/60"
                      />
                    </div>
                  </div>

                  {/* Message input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Detailed Message
                    </label>
                    <div className={`rounded-xl border bg-background/50 px-4 py-2 transition-all ${activeTheme.accent}`}>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={activeDetail.placeholderMessage}
                        className="block w-full border-0 bg-transparent text-sm text-foreground focus:outline-none placeholder-muted-foreground/60 resize-y min-h-[100px]"
                      />
                    </div>
                  </div>

                  {/* 3. Vibe selector (Concept item) */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Urgency Vibe
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["browsing", "standard", "urgent"] as VibeType[]).map((v) => {
                        const isVibeActive = activeVibe === v
                        let label = "☕ Browsing"
                        let activeStyles = "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        if (v === "standard") {
                          label = "⚡ Standard"
                          activeStyles = "bg-primary/10 border-primary/30 text-primary"
                        }
                        if (v === "urgent") {
                          label = "🚨 Urgent"
                          activeStyles = "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }

                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setActiveVibe(v)}
                            className={`py-2 px-3 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              isVibeActive
                                ? `${activeStyles} scale-[1.02] shadow-sm`
                                : "border-border/60 bg-card/20 text-muted-foreground hover:bg-card/50 hover:text-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive font-medium">{errorMsg}</p>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all hover:scale-[1.01] cursor-pointer shadow-lg ${activeTheme.accentButton} disabled:opacity-50`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Syncing Details...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send Contact Inquiry
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Success celebration overlay */}
              <AnimatePresence>
                {submittedData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center"
                  >
                    {/* Simulated particles/sparks */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            opacity: 0,
                            scale: 0.2,
                            x: 0,
                            y: 0
                          }}
                          animate={{
                            opacity: [0, 0.8, 0],
                            scale: [0.2, 1, 0.5],
                            x: (Math.random() - 0.5) * 300,
                            y: (Math.random() - 0.5) * 300
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 2,
                            ease: "easeOut"
                          }}
                          className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full blur-[1px] ${
                            i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-emerald-400" : "bg-violet-400"
                          }`}
                        />
                      ))}
                    </div>

                    <motion.div
                      initial={{ scale: 0.8, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="max-w-md space-y-6 relative z-10"
                    >
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="h-10 w-10 animate-bounce" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-foreground">
                          Mission Synced Successfully!
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Thanks, <span className="font-semibold text-foreground">{submittedData.name}</span>. We've registered your <span className="font-semibold text-foreground">{submittedData.category}</span> inquiry. A confirmation details package will be reviewed under email: <span className="font-semibold text-foreground">{submittedData.email}</span>.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => setSubmittedData(null)}
                          className="w-full py-3 px-5 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer"
                        >
                          Send another inquiry
                        </button>
                        <Link
                          href="/"
                          className="w-full py-3 px-5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.01] hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Back to Home <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import * as React from "react"
import { User, Mail, Phone, BookOpen, Shield, Ticket, Trophy, Award, Building2, Pencil, Loader2, X } from "lucide-react"
import { updateProfileAction } from "@/app/auth-actions"

interface StudentProfileClientProps {
  profile: any
  departments: { id: string; name: string }[]
  clubs: { id: string; name: string }[]
}

export function StudentProfileClient({ profile, departments, clubs }: StudentProfileClientProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState({
    name: profile.name || "",
    roll_number: profile.roll_number === "Not Assigned" ? "" : profile.roll_number || "",
    mobile: profile.mobile === "Not Set" ? "" : profile.mobile || "",
    department_id: profile.department_id || "",
    club_id: profile.club_id || "",
    section: profile.section || ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await updateProfileAction(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
        // Refresh page to show updated data
        window.location.reload()
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">My Campus Profile</h1>
          <p className="text-sm text-muted-foreground">View and edit your college identity records.</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all self-start"
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Card: Basic Profile */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-card/85 p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="h-16 w-16 rounded-2xl border border-border/50 overflow-hidden shrink-0 shadow-md bg-muted flex items-center justify-center">
              <img
                src={`https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${encodeURIComponent(profile.email || profile.name || 'guest')}`}
                alt="user avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-tight">{profile.name}</h2>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground mt-1 capitalize">
                {profile.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">University Roll No</p>
                <p className="text-sm font-semibold text-foreground font-mono mt-0.5">{profile.roll_number}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Email Address</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 truncate max-w-[220px]">{profile.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Mobile Contact</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{profile.mobile}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Academic Department</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 leading-tight">
                  {profile.department_name} {profile.section ? `(Sec ${profile.section})` : ""}
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Primary Student Club Affiliation</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 leading-tight">{profile.club_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Statistics Summary */}
        <div className="rounded-3xl border border-border bg-card/85 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">Campus Statistics</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Events Registered</span>
                </div>
                <span className="text-lg font-bold text-foreground">{profile.stats?.registered || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Certificates Earned</span>
                </div>
                <span className="text-lg font-bold text-foreground">{profile.stats?.certificates || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Teams Joined</span>
                </div>
                <span className="text-lg font-bold text-foreground">{profile.stats?.teams || 0}</span>
              </div>
            </div>

            {/* Premium Illustration */}
            <div className="pt-2 hidden sm:block relative w-full h-28 select-none">
              <img 
                src="/icons/undraw_recruiter-suggestions_afdd.svg" 
                alt="Profile achievements and suggestions" 
                className="w-full h-full object-contain opacity-80"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-6 text-[10px] text-muted-foreground text-center leading-relaxed">
            Ensure your details are up-to-date to receive certificates seamlessly.
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Recent Registrations */}
        <div className="rounded-3xl border border-border bg-card/85 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold text-foreground">Recent Registrations</h2>
          </div>
          <div className="space-y-3">
            {profile.recentRegs?.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-card/10 p-6 text-center text-muted-foreground text-sm">
                No recent event registrations.
              </div>
            ) : (
              profile.recentRegs?.map((reg: any) => {
                const event = reg.events
                if (!event) return null
                const catName = event.categories?.name || "Event"
                
                return (
                  <div key={reg.id} className="rounded-xl border border-border/80 bg-card/40 p-4 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        {catName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">Date: {event.event_date} | Venue: {event.venue}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="rounded-3xl border border-border bg-card/85 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold text-foreground">Recent Certificates</h2>
          </div>
          <div className="space-y-3">
            {profile.recentCerts?.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-card/10 p-6 text-center text-muted-foreground text-sm">
                No certificates earned yet.
              </div>
            ) : (
              profile.recentCerts?.map((cert: any) => {
                const event = cert.events
                if (!event) return null
                
                return (
                  <div key={cert.id} className="rounded-xl border border-border/80 bg-card/40 p-4 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                        {cert.cert_type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(cert.generated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
              <p className="text-sm text-muted-foreground">Update your campus identity records.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Roll Number</label>
                  <input
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. CS2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</label>
                  <input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. +1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Section</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select Section</option>
                    {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                      <option key={letter} value={letter}>Section {letter}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Club</label>
                <select
                  name="club_id"
                  value={formData.club_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a club</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

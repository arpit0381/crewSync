"use client"

import * as React from "react"
import { Users, Shield, Copy, Calendar, Award, CheckCircle2, AlertTriangle, LogOut } from "lucide-react"

interface Team {
  id: string
  name: string
  invite_code: string
  captain_name: string
  is_captain: boolean
  event_id: string
  event_title: string
  members: string[]
  min_members: number
  max_members: number
}

interface TeamsClientProps {
  teams: Team[]
}

export function TeamsClient({ teams }: TeamsClientProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error("Failed to copy code", err)
    }
  }

  const handleCopyInviteLink = async (eventId: string, code: string) => {
    const inviteUrl = `${window.location.origin}/events/${eventId}?action=register&invite=${code}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedCode(`link-${code}`)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error("Failed to copy link", err)
    }
  }

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to leave this team? This action cannot be undone.")) return
    
    // In a real implementation, this would call a Server Action to leave the team.
    // For now, we will show an alert to the user.
    alert("Leave team functionality is not fully implemented yet. Ask the admin to remove you.")
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card/10">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p>You are not registered in any team events yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Form or join a team during registration of sports or coding events.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 relative">
      {/* Toast Notification */}
      {copiedCode && copiedCode.startsWith('link-') && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-primary/20">
            <CheckCircle2 className="h-5 w-5" />
            <span>Invite link copied! Share it with your team.</span>
          </div>
        </div>
      )}

      {teams.map((team) => {
        const isFull = team.members.length >= team.max_members
        const isQualified = team.members.length >= team.min_members
        const progressPercentage = Math.min(100, (team.members.length / team.max_members) * 100)

        return (
          <div
            key={team.id}
            className="rounded-3xl border border-border bg-card/30 p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <Calendar className="h-3 w-3" />
                    {team.event_title}
                  </span>
                  <h3 className="text-lg font-bold text-foreground leading-tight mt-1">{team.name}</h3>
                </div>

                {team.is_captain && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                    <Shield className="h-3 w-3" />
                    Captain
                  </span>
                )}
              </div>

              {/* Capacity Progress */}
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">Team Capacity</span>
                  <span className={isFull ? "text-green-500" : "text-primary"}>
                    {team.members.length} / {team.max_members} Filled
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                  <div 
                    className={`h-full transition-all duration-500 ${isFull ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {!isQualified && (
                  <p className="text-[10px] text-amber-500 flex items-center gap-1 mt-1 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Needs {team.min_members - team.members.length} more member(s) to qualify
                  </p>
                )}
                {isQualified && !isFull && (
                  <p className="text-[10px] text-green-500 flex items-center gap-1 mt-1 font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Qualified to participate
                  </p>
                )}
              </div>

              {/* Team Members */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Crew Members ({team.members.length})</span>
                <ul className="grid grid-cols-2 gap-2">
                  {team.members.map((member: string, i: number) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-foreground bg-background/40 px-3 py-2 rounded-xl border border-border">
                      <div className="h-2 w-2 rounded-full bg-zinc-500 shrink-0" />
                      <span className="truncate">{member}</span>
                      {member === team.captain_name && (
                        <span className="text-[9px] text-yellow-500 font-bold shrink-0">(C)</span>
                      )}
                    </li>
                  ))}
                  {Array.from({ length: Math.max(0, team.max_members - team.members.length) }).map((_, i) => (
                    <li key={`empty-${i}`} className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-background/20 px-3 py-2 rounded-xl border border-dashed border-border/60">
                      <span className="text-[10px] uppercase font-bold">Empty Slot</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Details/Actions */}
            <div className="border-t border-border pt-4 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Captain in charge</p>
                <p className="text-xs font-semibold text-foreground">{team.captain_name}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!team.is_captain && (
                  <button
                    onClick={() => handleLeaveTeam(team.id)}
                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                    title="Leave Team"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}

                {team.is_captain && team.invite_code ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="bg-background border border-border rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 flex-1">
                      <div>
                        <p className="text-[8px] text-muted-foreground uppercase font-semibold">Invite Code</p>
                        <p className="text-sm font-black tracking-widest text-primary font-mono">{team.invite_code}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(team.invite_code)}
                        className={`p-1.5 rounded-lg transition-all border ${
                          copiedCode === team.invite_code 
                            ? "bg-green-500/10 border-green-500/20 text-green-500" 
                            : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        }`}
                        title="Copy Invite Code"
                      >
                        {copiedCode === team.invite_code ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleCopyInviteLink(team.event_id, team.invite_code)}
                      className={`bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                        copiedCode === `link-${team.invite_code}` ? "bg-green-500 text-white" : ""
                      }`}
                    >
                      {copiedCode === `link-${team.invite_code}` ? <CheckCircle2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      {copiedCode === `link-${team.invite_code}` ? "Copied Link!" : "Invite Link"}
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground bg-background/20 px-3 py-1.5 rounded-lg border border-border flex-1 sm:flex-none text-center">
                    Invite code protected
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

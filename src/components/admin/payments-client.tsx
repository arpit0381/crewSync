"use client"

import React, { useState } from "react"
import { Check, X, Search, Clock, CreditCard, ShieldAlert, Loader2, Image as ImageIcon, Sparkles, Building, Flag, Mail, Phone, Calendar } from "lucide-react"
import { verifyPaymentAction, rejectPaymentAction } from "@/app/payment-actions"

interface PendingPayment {
  id: string
  created_at: string
  payment_status: string
  payment_screenshot_url: string | null
  transaction_id: string | null
  team_id: string | null
  is_captain: boolean
  profiles: {
    name: string
    roll_number: string
    email: string
    mobile: string
    department: string | null
    club: string | null
  } | null
  events: {
    id: string
    title: string
    fee_amount: number
  } | null
}

interface PaymentsClientProps {
  initialPayments: PendingPayment[]
}

export function PaymentsClient({ initialPayments }: PaymentsClientProps) {
  const [payments, setPayments] = useState<PendingPayment[]>(initialPayments)
  const [search, setSearch] = useState("")
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "rejected">("pending")
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("All Events")

  // 1. Calculate event-wise metrics for the selected event (or overall)
  const eventPayments = selectedEventFilter === "All Events" 
    ? payments 
    : payments.filter(p => p.events?.title === selectedEventFilter)

  // 2. Tab counts (matches the selected event filter)
  const pendingCount = eventPayments.filter(p => p.payment_status === "pending_verification" && p.is_captain).length
  const verifiedCount = eventPayments.filter(p => p.payment_status === "verified" && p.is_captain).length
  const rejectedCount = eventPayments.filter(p => p.payment_status === "rejected" && p.is_captain).length

  // 3. Global overall metrics (for the top cards summary)
  const overallPending = payments.filter(p => p.payment_status === "pending_verification" && p.is_captain).length
  const overallVerified = payments.filter(p => p.payment_status === "verified" && p.is_captain).length
  const overallRejected = payments.filter(p => p.payment_status === "rejected" && p.is_captain).length
  
  const totalRevenue = payments
    .filter(p => p.payment_status === "verified" && p.is_captain)
    .reduce((sum, p) => sum + (p.events?.fee_amount || 0), 0)

  // Unique events list for event-wise filtering
  const uniqueEvents = Array.from(new Set(payments.map(p => p.events?.title).filter(Boolean))) as string[]

  const filteredPayments = payments.filter((p) => {
    const matchesTab = 
      (activeTab === "pending" && p.payment_status === "pending_verification") ||
      (activeTab === "verified" && p.payment_status === "verified") ||
      (activeTab === "rejected" && p.payment_status === "rejected")

    const matchesEvent = selectedEventFilter === "All Events" || p.events?.title === selectedEventFilter

    const term = search.toLowerCase()
    const matchesSearch =
      p.profiles?.name?.toLowerCase().includes(term) ||
      p.profiles?.roll_number?.toLowerCase().includes(term) ||
      p.events?.title?.toLowerCase().includes(term) ||
      p.transaction_id?.toLowerCase().includes(term)

    return matchesTab && matchesEvent && matchesSearch && p.is_captain
  })
    
  const eventRevenue = eventPayments
    .filter(p => p.payment_status === "verified" && p.is_captain)
    .reduce((sum, p) => sum + (p.events?.fee_amount || 0), 0)
    
  const eventVerifiedCount = verifiedCount
  const eventPendingCount = pendingCount

  const handleVerify = async (id: string) => {
    setLoadingAction(`verify-${id}`)
    const res = await verifyPaymentAction(id)
    if (res.success) {
      const verifiedPayment = payments.find(p => p.id === id)
      setPayments((prev) => prev.map((p) => {
        if (p.id === id || (verifiedPayment?.team_id && p.team_id === verifiedPayment.team_id)) {
          return { ...p, payment_status: "verified" }
        }
        return p
      }))
    } else {
      alert(res.error)
    }
    setLoadingAction(null)
  }

  const handleReject = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject this payment?")) return
    
    setLoadingAction(`reject-${id}`)
    const res = await rejectPaymentAction(id)
    if (res.success) {
      const rejectedPayment = payments.find(p => p.id === id)
      setPayments((prev) => prev.map((p) => {
        if (p.id === id || (rejectedPayment?.team_id && p.team_id === rejectedPayment.team_id)) {
          return { ...p, payment_status: "rejected" }
        }
        return p
      }))
    } else {
      alert(res.error)
    }
    setLoadingAction(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Payment Control Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor revenue stats, filter event-wise transactions, and verify registrations.</p>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-sm">
          <div className="absolute right-4 top-4 text-emerald-500 bg-emerald-500/10 p-2 rounded-xl">
            <CreditCard className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">₹{totalRevenue}</p>
          <p className="text-[10px] text-muted-foreground mt-1">From verified registrations</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-sm">
          <div className="absolute right-4 top-4 text-amber-500 bg-amber-500/10 p-2 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Verification</p>
          <p className="text-3xl font-black text-amber-400 mt-2">{overallPending}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Requires immediate review</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-sm">
          <div className="absolute right-4 top-4 text-primary bg-primary/10 p-2 rounded-xl">
            <Check className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verified Payments</p>
          <p className="text-3xl font-black text-primary mt-2">{overallVerified}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Approved registration tickets</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-sm">
          <div className="absolute right-4 top-4 text-red-500 bg-red-500/10 p-2 rounded-xl">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rejected Payments</p>
          <p className="text-3xl font-black text-red-400 mt-2">{overallRejected}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Invalid payment references</p>
        </div>
      </div>

      {/* Event-Wise Details / Filter Sub-Dashboard */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-primary shrink-0 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> Filter Event
          </span>
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold focus:border-primary focus:outline-none transition-all text-foreground"
          >
            <option value="All Events">All Events</option>
            {uniqueEvents.map((evt) => (
              <option key={evt} value={evt}>{evt}</option>
            ))}
          </select>
        </div>

        {/* Selected Event Stats */}
        <div className="flex items-center gap-6 divide-x divide-white/10 text-xs font-medium">
          <div className="pl-0">
            <span className="text-muted-foreground">Event Revenue: </span>
            <span className="font-bold text-emerald-400">₹{eventRevenue}</span>
          </div>
          <div className="pl-6">
            <span className="text-muted-foreground">Verified: </span>
            <span className="font-bold text-primary">{eventVerifiedCount}</span>
          </div>
          <div className="pl-6">
            <span className="text-muted-foreground">Pending: </span>
            <span className="font-bold text-amber-500">{eventPendingCount}</span>
          </div>
        </div>
      </div>

      {/* Main Section with Tabs */}
      <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 space-y-6">
        
        {/* Navigation Tabs and Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-border pb-4">
          <div className="flex rounded-xl bg-background/60 p-1 border border-border">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "pending"
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("verified")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "verified"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              Approved ({verifiedCount})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "rejected"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Rejected ({rejectedCount})
            </button>
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, UTR/Tx ID..."
              className="pl-9 pr-4 py-2 block w-full rounded-xl border border-border bg-background text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Payments list Table */}
        {filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
            No registrations found in this category.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto border border-border/50 rounded-2xl hidden lg:block">
              <table className="w-full text-left text-sm text-foreground">
                <thead className="bg-background/40 text-xs font-bold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Student & Details</th>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Payment UTR / Date</th>
                    <th className="px-6 py-4">Screenshot</th>
                    <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-card/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground text-sm">{p.profiles?.name}</p>
                          {p.team_id && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-violet-500/15 border border-violet-500/30 text-violet-400 px-2 py-0.5 rounded-md">
                              Team Captain
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.profiles?.roll_number}</p>
                        
                        {/* Person Details Grid */}
                        <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-muted-foreground border-t border-white/5 pt-2 max-w-sm">
                          <span className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0" /> {p.profiles?.email}</span>
                          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" /> {p.profiles?.mobile}</span>
                          {p.profiles?.department && <span className="flex items-center gap-1.5"><Building className="h-3 w-3 shrink-0" /> {p.profiles.department}</span>}
                          {p.profiles?.club && <span className="flex items-center gap-1.5"><Flag className="h-3 w-3 shrink-0" /> {p.profiles.club}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-foreground">{p.events?.title}</p>
                        <p className="text-xs text-primary font-bold mt-0.5">₹{p.events?.fee_amount}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {p.transaction_id ? (
                            <span className="font-mono text-muted-foreground bg-background px-2 py-1 rounded w-fit border border-border">{p.transaction_id}</span>
                          ) : (
                            <span className="text-muted-foreground italic">No Tx ID Provided</span>
                          )}
                          <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                             <Calendar className="h-3 w-3" /> {new Date(p.created_at).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.payment_screenshot_url ? (
                          <button 
                            onClick={() => setSelectedScreenshot(p.payment_screenshot_url)}
                            className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                          >
                            <ImageIcon className="h-4 w-4" /> View Screenshot
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">No screenshot</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.payment_status === "pending_verification" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleReject(p.id)}
                              disabled={loadingAction !== null}
                              className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
                              title="Reject"
                            >
                              {loadingAction === `reject-${p.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleVerify(p.id)}
                              disabled={loadingAction !== null}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 text-xs shadow-md shadow-primary/10"
                            >
                              {loadingAction === `verify-${p.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              Approve
                            </button>
                          </div>
                        ) : p.payment_status === "verified" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <Check className="h-3.5 w-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                            <ShieldAlert className="h-3.5 w-3.5" /> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {filteredPayments.map((p) => (
                 <div key={p.id} className="bg-card/40 border border-border rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-foreground">{p.profiles?.name}</h4>
                          {p.team_id && (
                            <span className="text-[8px] font-black uppercase tracking-wider bg-violet-500/15 border border-violet-500/30 text-violet-400 px-1.5 py-0.5 rounded-md">
                              Captain
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.profiles?.roll_number}</p>
                      </div>
                      <span className="bg-primary/10 text-primary font-black text-xs px-2.5 py-1 rounded-lg border border-primary/20">
                        ₹{p.events?.fee_amount}
                      </span>
                    </div>

                    {/* Person Details Collapse */}
                    <div className="space-y-1.5 text-[10px] text-muted-foreground bg-background/30 p-3 rounded-xl border border-border/60">
                      <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {p.profiles?.email}</p>
                      <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {p.profiles?.mobile}</p>
                      {p.profiles?.department && <p className="flex items-center gap-1.5"><Building className="h-3 w-3" /> {p.profiles.department}</p>}
                      {p.profiles?.club && <p className="flex items-center gap-1.5"><Flag className="h-3 w-3" /> {p.profiles.club}</p>}
                    </div>

                    <div className="space-y-1 bg-background/50 p-3 rounded-xl border border-border">
                      <p className="text-xs font-semibold text-foreground">{p.events?.title}</p>
                      {p.transaction_id && <p className="text-[10px] font-mono text-muted-foreground">Tx: {p.transaction_id}</p>}
                      <p className="text-[9px] text-muted-foreground mt-1">{new Date(p.created_at).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2">
                      {p.payment_screenshot_url && (
                        <button 
                          onClick={() => setSelectedScreenshot(p.payment_screenshot_url)}
                          className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-2.5 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        >
                          <ImageIcon className="h-4 w-4" /> View Screenshot Image
                        </button>
                      )}
                    </div>

                    {p.payment_status === "pending_verification" ? (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button
                          onClick={() => handleReject(p.id)}
                          disabled={loadingAction !== null}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all font-semibold text-xs disabled:opacity-50"
                        >
                          {loadingAction === `reject-${p.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          Reject
                        </button>
                        <button
                          onClick={() => handleVerify(p.id)}
                          disabled={loadingAction !== null}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all text-xs disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                          {loadingAction === `verify-${p.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Approve
                        </button>
                      </div>
                    ) : p.payment_status === "verified" ? (
                      <div className="w-full flex justify-center items-center gap-2 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold text-xs border border-emerald-500/20">
                         <Check className="h-4 w-4" /> Verified
                      </div>
                    ) : (
                      <div className="w-full flex justify-center items-center gap-2 py-2.5 bg-red-500/10 text-red-400 rounded-xl font-bold text-xs border border-red-500/20">
                         <ShieldAlert className="h-4 w-4" /> Rejected
                      </div>
                    )}
                 </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setSelectedScreenshot(null)}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-14 right-0 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={selectedScreenshot} alt="Payment Screenshot" className="w-full max-h-[80vh] object-contain rounded-3xl border border-white/10 shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  )
}

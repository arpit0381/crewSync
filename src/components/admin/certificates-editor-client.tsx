"use client"

import * as React from "react"
import { createCertificateTemplateAction } from "@/app/certificate-actions"
import { Award, Sliders, Check, Loader2, ArrowRight } from "lucide-react"

interface Event {
  id: string
  title: string
  event_date: string
}

interface CertificatesEditorProps {
  events: Event[]
}

export function CertificatesEditorClient({ events }: CertificatesEditorProps) {
  const [selectedEventId, setSelectedEventId] = React.useState(events[0]?.id || "")
  const [imageUrl, setImageUrl] = React.useState("")
  
  // Coordinates states
  const [nameX, setNameX] = React.useState(148) // Center of A4 in mm
  const [nameY, setNameY] = React.useState(85)
  const [nameSize, setNameSize] = React.useState(32)

  const [dateX, setDateX] = React.useState(148)
  const [dateY, setDateY] = React.useState(138)
  const [dateSize, setDateSize] = React.useState(10)

  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEventId) return

    setLoading(true)
    setSuccess(null)

    const titleCoords = { x: 148, y: 45, fontSize: 28 }
    const nameCoords = { x: nameX, y: nameY, fontSize: nameSize }
    const dateCoords = { x: dateX, y: dateY, fontSize: dateSize }

    const formData = new FormData(e.currentTarget)
    formData.append("event_id", selectedEventId)
    formData.append("title_coords", JSON.stringify(titleCoords))
    formData.append("name_coords", JSON.stringify(nameCoords))
    formData.append("date_coords", JSON.stringify(dateCoords))

    const result = await createCertificateTemplateAction(formData)

    if (result.success) {
      setSuccess(result.success)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Certificate Engine</h1>
        <p className="text-sm text-zinc-400">Design template text coordinates and configure bulk dispatch requirements.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Settings Panel */}
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Event Link</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-primary focus:outline-none text-sm font-semibold transition-all"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Template File (Image)</label>
              <input
                name="template_file"
                type="file"
                accept="image/*"
                className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white focus:border-primary focus:outline-none text-xs transition-all"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Leave empty to use our premium gold-border default design template.</p>
            </div>

            {/* Sliders for Student Name coordinates */}
            <div className="border-t border-zinc-850 pt-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <Sliders className="h-4 w-4" />
                <span>Student Name Placement Coordinates</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Horizontal (X Coordinate): {nameX}mm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="280"
                  value={nameX}
                  onChange={(e) => setNameX(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Vertical (Y Coordinate): {nameY}mm</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="190"
                  value={nameY}
                  onChange={(e) => setNameY(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Font Size: {nameSize}pt</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={nameSize}
                  onChange={(e) => setNameSize(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Date coordinates */}
            <div className="border-t border-zinc-850 pt-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <Sliders className="h-4 w-4" />
                <span>Issue Date Placement Coordinates</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase">Vertical (Y)</label>
                  <input
                    type="number"
                    value={dateY}
                    onChange={(e) => setDateY(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase">Font Size</label>
                  <input
                    type="number"
                    value={dateSize}
                    onChange={(e) => setDateSize(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-primary text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 text-xs text-center font-semibold mt-4">
              {success}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-zinc-850">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Publish Certificate Layout
            </button>
          </div>
        </form>

        {/* Right: Layout Visualizer Box */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col items-center justify-center relative min-h-[400px]">
          <p className="absolute top-4 left-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Interactive Visualizer Map</p>
          
          {/* Certificate mock canvas layout */}
          <div className="w-full max-w-[420px] aspect-[1.41] bg-zinc-900 rounded-xl border border-zinc-800 relative p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Gold borders */}
            <div className="absolute inset-2 border border-yellow-600/30 rounded-lg pointer-events-none" />
            
            <div className="text-center mt-6">
              <h3 className="text-yellow-600 font-serif text-sm italic">Certificate of Completion</h3>
              <p className="text-[6px] text-zinc-500 uppercase tracking-widest mt-1">Proudly Presented To</p>
            </div>

            {/* Dynamic Student Name visual feedback */}
            <div
              style={{
                top: `${(nameY / 210) * 100}%`,
                left: `${(nameX / 297) * 100}%`,
                fontSize: `${(nameSize / 32) * 18}px`
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-white font-serif font-bold whitespace-nowrap"
            >
              [ Student Name ]
            </div>

            <div className="text-center mb-8">
              <p className="text-[6px] text-zinc-400">for participation in the campus event</p>
              <p className="text-[8px] font-bold text-white mt-1">Tech Heist 2026</p>
              
              {/* Dynamic Date Visualizer */}
              <p
                style={{
                  top: `${(dateY / 210) * 100}%`,
                  fontSize: `${(dateSize / 10) * 6}px`
                }}
                className="absolute left-1/2 -translate-x-1/2 text-zinc-500 font-medium"
              >
                Date: 2026-07-15
              </p>
            </div>

            {/* Mock signatures */}
            <div className="flex justify-between px-6 text-[5px] text-zinc-500 mb-2">
              <div className="border-t border-zinc-800 w-12 pt-1 text-center">Coordinator</div>
              <div className="border-t border-zinc-800 w-12 pt-1 text-center">Director</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Certificate Themes Library
 * 10 built-in premium certificate themes rendered via jsPDF draw calls.
 * Each theme defines colors, typography, and a full PDF render function.
 */

import jsPDF from "jspdf"

// ─── Theme Data Types ───────────────────────────────────────────────
export interface CertificateTheme {
  id: string
  name: string
  category: "professional" | "creative" | "minimal" | "energetic"
  description: string
  colors: {
    bg: [number, number, number]
    border: [number, number, number]
    title: [number, number, number]
    subtitle: [number, number, number]
    name: [number, number, number]
    text: [number, number, number]
    accent: [number, number, number]
    signatureLine: [number, number, number]
  }
  preview: {
    bgClass: string
    borderClass: string
    titleClass: string
    nameClass: string
    accentClass: string
  }
}

export interface CertificateData {
  studentName: string
  eventName: string
  eventDate: string
  issueDate: string
  certType: "participation" | "winner" | "runner_up" | "volunteer" | "organizer"
  certTitle: string
  certSubtitle: string
  description: string
  signatoryLeftName: string
  signatoryLeftTitle: string
  signatoryRightName: string
  signatoryRightTitle: string
  certificateNumber: string
  verificationUrl?: string
  includeQr: boolean
  qrDataUrl?: string
}

// ─── Theme Definitions ──────────────────────────────────────────────
export const CERTIFICATE_THEMES: CertificateTheme[] = [
  {
    id: "modern-gold",
    name: "Modern Gold",
    category: "professional",
    description: "Elegant dark background with gold accents and serif typography",
    colors: {
      bg: [15, 15, 17],
      border: [212, 175, 55],
      title: [212, 175, 55],
      subtitle: [180, 180, 180],
      name: [255, 255, 255],
      text: [160, 160, 160],
      accent: [212, 175, 55],
      signatureLine: [100, 100, 100],
    },
    preview: {
      bgClass: "bg-[#0f0f11]",
      borderClass: "border-yellow-600/40",
      titleClass: "text-yellow-500",
      nameClass: "text-white",
      accentClass: "text-yellow-600",
    },
  },
  {
    id: "elegant-blue",
    name: "Elegant Blue",
    category: "professional",
    description: "Navy gradient with silver-white text and clean lines",
    colors: {
      bg: [12, 25, 55],
      border: [70, 130, 220],
      title: [120, 180, 255],
      subtitle: [160, 190, 230],
      name: [255, 255, 255],
      text: [150, 180, 220],
      accent: [70, 130, 220],
      signatureLine: [80, 120, 180],
    },
    preview: {
      bgClass: "bg-[#0c1937]",
      borderClass: "border-blue-500/40",
      titleClass: "text-blue-400",
      nameClass: "text-white",
      accentClass: "text-blue-500",
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    category: "creative",
    description: "Deep purple with gold accents and ornate corners",
    colors: {
      bg: [25, 12, 45],
      border: [180, 130, 255],
      title: [200, 160, 255],
      subtitle: [170, 150, 200],
      name: [255, 255, 255],
      text: [160, 140, 190],
      accent: [212, 175, 55],
      signatureLine: [120, 90, 160],
    },
    preview: {
      bgClass: "bg-[#190c2d]",
      borderClass: "border-purple-500/40",
      titleClass: "text-purple-400",
      nameClass: "text-white",
      accentClass: "text-yellow-500",
    },
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    category: "minimal",
    description: "Clean white background with thin gray borders",
    colors: {
      bg: [255, 255, 255],
      border: [200, 200, 200],
      title: [30, 30, 30],
      subtitle: [120, 120, 120],
      name: [10, 10, 10],
      text: [100, 100, 100],
      accent: [60, 60, 60],
      signatureLine: [180, 180, 180],
    },
    preview: {
      bgClass: "bg-white",
      borderClass: "border-gray-300",
      titleClass: "text-gray-800",
      nameClass: "text-black",
      accentClass: "text-gray-500",
    },
  },
  {
    id: "academic-green",
    name: "Academic Green",
    category: "professional",
    description: "Forest green borders with classic academic feel",
    colors: {
      bg: [245, 243, 235],
      border: [34, 100, 60],
      title: [24, 80, 45],
      subtitle: [80, 80, 70],
      name: [15, 15, 15],
      text: [70, 70, 60],
      accent: [34, 100, 60],
      signatureLine: [120, 120, 110],
    },
    preview: {
      bgClass: "bg-[#f5f3eb]",
      borderClass: "border-green-800/40",
      titleClass: "text-green-800",
      nameClass: "text-gray-900",
      accentClass: "text-green-700",
    },
  },
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    category: "professional",
    description: "Jet black with platinum borders and ultra-premium feel",
    colors: {
      bg: [8, 8, 10],
      border: [200, 200, 210],
      title: [220, 220, 230],
      subtitle: [140, 140, 150],
      name: [255, 255, 255],
      text: [130, 130, 140],
      accent: [200, 200, 210],
      signatureLine: [80, 80, 90],
    },
    preview: {
      bgClass: "bg-[#08080a]",
      borderClass: "border-gray-400/30",
      titleClass: "text-gray-300",
      nameClass: "text-white",
      accentClass: "text-gray-400",
    },
  },
  {
    id: "corporate-silver",
    name: "Corporate Silver",
    category: "minimal",
    description: "Steel gray gradient with professional clean layout",
    colors: {
      bg: [240, 242, 245],
      border: [150, 155, 165],
      title: [50, 55, 65],
      subtitle: [100, 105, 115],
      name: [20, 25, 35],
      text: [90, 95, 105],
      accent: [80, 85, 95],
      signatureLine: [160, 165, 175],
    },
    preview: {
      bgClass: "bg-[#f0f2f5]",
      borderClass: "border-gray-400/40",
      titleClass: "text-gray-700",
      nameClass: "text-gray-900",
      accentClass: "text-gray-500",
    },
  },
  {
    id: "tech-gradient",
    name: "Tech Gradient",
    category: "creative",
    description: "Cyan-to-purple gradient borders with modern tech aesthetic",
    colors: {
      bg: [10, 10, 20],
      border: [0, 200, 220],
      title: [0, 220, 240],
      subtitle: [140, 160, 190],
      name: [255, 255, 255],
      text: [130, 150, 180],
      accent: [160, 80, 255],
      signatureLine: [60, 80, 120],
    },
    preview: {
      bgClass: "bg-[#0a0a14]",
      borderClass: "border-cyan-500/40",
      titleClass: "text-cyan-400",
      nameClass: "text-white",
      accentClass: "text-purple-500",
    },
  },
  {
    id: "esports-neon",
    name: "Esports Neon",
    category: "energetic",
    description: "Dark background with neon green glow effects",
    colors: {
      bg: [5, 10, 5],
      border: [0, 255, 100],
      title: [0, 255, 120],
      subtitle: [100, 200, 130],
      name: [255, 255, 255],
      text: [80, 180, 110],
      accent: [0, 255, 100],
      signatureLine: [40, 100, 60],
    },
    preview: {
      bgClass: "bg-[#050a05]",
      borderClass: "border-green-400/40",
      titleClass: "text-green-400",
      nameClass: "text-white",
      accentClass: "text-green-500",
    },
  },
  {
    id: "sports-champion",
    name: "Sports Champion",
    category: "energetic",
    description: "Red and gold theme with bold athletic typography",
    colors: {
      bg: [30, 8, 8],
      border: [220, 50, 50],
      title: [255, 80, 60],
      subtitle: [200, 150, 120],
      name: [255, 255, 255],
      text: [180, 140, 120],
      accent: [212, 175, 55],
      signatureLine: [120, 60, 50],
    },
    preview: {
      bgClass: "bg-[#1e0808]",
      borderClass: "border-red-600/40",
      titleClass: "text-red-400",
      nameClass: "text-white",
      accentClass: "text-yellow-500",
    },
  },
]

export function getThemeById(id: string): CertificateTheme {
  return CERTIFICATE_THEMES.find((t) => t.id === id) || CERTIFICATE_THEMES[0]
}

// ─── jsPDF Render Function ──────────────────────────────────────────
export function renderThemeToPDF(doc: jsPDF, themeId: string, data: CertificateData) {
  const theme = getThemeById(themeId)
  const c = theme.colors
  const w = 297
  const h = 210

  // 1. Background
  doc.setFillColor(...c.bg)
  doc.rect(0, 0, w, h, "F")

  // 2. Borders
  doc.setDrawColor(...c.border)
  doc.setLineWidth(1.5)
  doc.rect(10, 10, w - 20, h - 20)
  doc.setLineWidth(0.5)
  doc.rect(12, 12, w - 24, h - 24)

  // 3. Corner decorations
  doc.setFillColor(...c.border)
  const cornerSize = 13
  // Top-Left
  doc.triangle(12, 12, 12 + cornerSize, 12, 12, 12 + cornerSize, "F")
  // Top-Right
  doc.triangle(w - 12, 12, w - 12 - cornerSize, 12, w - 12, 12 + cornerSize, "F")
  // Bottom-Left
  doc.triangle(12, h - 12, 12 + cornerSize, h - 12, 12, h - 12 - cornerSize, "F")
  // Bottom-Right
  doc.triangle(w - 12, h - 12, w - 12 - cornerSize, h - 12, w - 12, h - 12 - cornerSize, "F")

  // 4. Accent line under title area
  doc.setDrawColor(...c.accent)
  doc.setLineWidth(0.8)
  doc.line(w / 2 - 60, 52, w / 2 + 60, 52)

  // 5. Certificate Title
  doc.setFont("Times", "italic")
  doc.setFontSize(26)
  doc.setTextColor(...c.title)
  doc.text(data.certTitle, w / 2, 45, { align: "center" })

  // 6. Subtitle
  doc.setFont("Helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...c.subtitle)
  doc.text(data.certSubtitle.toUpperCase(), w / 2, 60, { align: "center" })

  // 7. Student Name
  doc.setFont("Times", "bold")
  doc.setFontSize(30)
  doc.setTextColor(...c.name)
  doc.text(data.studentName, w / 2, 90, { align: "center" })

  // 8. Underline name
  doc.setDrawColor(...c.signatureLine)
  doc.setLineWidth(0.4)
  const nameWidth = doc.getTextWidth(data.studentName)
  const nameLineHalf = Math.min(nameWidth / 2 + 15, 80)
  doc.line(w / 2 - nameLineHalf, 96, w / 2 + nameLineHalf, 96)

  // 9. Description
  doc.setFont("Helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(...c.text)
  doc.text(data.description, w / 2, 108, { align: "center" })

  // 10. Event Name
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(...c.name)
  doc.text(`"${data.eventName}"`, w / 2, 120, { align: "center" })

  // 11. (Removed Certificate type badge as requested)

  // 12. Date + Certificate ID + Department row
  doc.setFont("Helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...c.text)
  const dateStr = `Date: ${data.issueDate || data.eventDate}`
  const idStr = `ID: ${data.certificateNumber}`
  doc.text(`${dateStr}          ${idStr}`, w / 2, 158, { align: "center" })

  // 13. Signatures
  doc.setFont("Helvetica", "italic")
  doc.setFontSize(9)
  doc.setTextColor(...c.text)
  doc.text(data.signatoryLeftName, 77.5, 181, { align: "center" })
  doc.text(data.signatoryRightName, w - 77.5, 181, { align: "center" })

  doc.setFont("Helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...c.subtitle)
  doc.text(data.signatoryLeftTitle, 77.5, 186, { align: "center" })
  doc.text(data.signatoryRightTitle, w - 77.5, 186, { align: "center" })

  // 14. QR Code (if provided as data URL)
  if (data.includeQr && data.qrDataUrl) {
    try {
      doc.addImage(data.qrDataUrl, "PNG", w / 2 - 12.5, 162, 25, 25)
    } catch {
      // QR code rendering failed silently
    }
  }

  // 15. Verification footer
  doc.setFont("Helvetica", "normal")
  doc.setFontSize(6)
  doc.setTextColor(...c.signatureLine)
  doc.text(
    `VERIFICATION ID: ${data.certificateNumber} | Verify at: ${data.verificationUrl || "crewarena.com/verify"}`,
    w / 2,
    194,
    { align: "center" }
  )

  // 16. Crew Arena branding
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(5)
  doc.setTextColor(...c.signatureLine)
  doc.text("Powered by CREW ARENA", w / 2, 206, { align: "center" })
}

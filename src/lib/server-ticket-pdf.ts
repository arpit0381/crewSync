import jsPDF from "jspdf"
import QRCode from "qrcode"

interface TicketPDFData {
  ticketCode: string
  userName: string
  userRoll: string
  userEmail: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  categoryName: string
}

export async function generateTicketPDFBase64(data: TicketPDFData): Promise<string> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  })

  // 1. Rich Deep Dark Theme Background
  doc.setFillColor(10, 10, 12)
  doc.rect(0, 0, 148, 210, "F")

  // 2. Premium Outer Frame Accent (Indigo)
  doc.setDrawColor(79, 70, 229)
  doc.setLineWidth(0.8)
  doc.rect(8, 8, 132, 194)

  // 3. Header Ticket Accent (Indigo Banner)
  doc.setFillColor(79, 70, 229)
  doc.rect(8, 8, 132, 18, "F")

  // Brand Name & Pass Type
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text("CREW SYNC", 14, 15)
  doc.setFont("Helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(224, 231, 255)
  doc.text("CAMPUS EVENT ACCESS PASS", 14, 21)

  // Ticket Number (Top Right)
  doc.setFont("Courier", "bold")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(data.ticketCode, 134, 18, { align: "right" })

  // 4. Attendee details section
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(129, 140, 248)
  doc.text("ATTENDEE IDENTITY", 14, 38)

  // Name & Roll No
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text(data.userName.toUpperCase(), 14, 46)

  doc.setFont("Helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text(`ROLL NO: ${data.userRoll}`, 14, 52)
  doc.text(`EMAIL: ${data.userEmail}`, 14, 56)

  // 5. Divider
  doc.setDrawColor(31, 41, 55)
  doc.setLineWidth(0.3)
  doc.line(12, 62, 136, 62)

  // 6. Event details section
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(129, 140, 248)
  doc.text("EVENT ACCESS PARAMETERS", 14, 72)

  // Event Title
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  const splitTitle = doc.splitTextToSize(data.eventTitle, 118)
  doc.text(splitTitle, 14, 80)

  const titleLines = splitTitle.length || 1
  const detailsY = 80 + (titleLines * 6) + 4

  // Details Grid Layout
  // Column 1: Date & Venue
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text("DATE", 14, detailsY)
  doc.text("VENUE", 14, detailsY + 14)

  doc.setFont("Helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(data.eventDate, 14, detailsY + 5)
  doc.setFont("Helvetica", "normal")
  const splitVenue = doc.splitTextToSize(data.venue, 55)
  doc.text(splitVenue, 14, detailsY + 19)

  // Column 2: Time & Category
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text("TIME", 78, detailsY)
  doc.text("CATEGORY / REG TYPE", 78, detailsY + 14)

  doc.setFont("Helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(data.eventTime, 78, detailsY + 5)
  doc.setFont("Helvetica", "normal")
  doc.text(`${data.categoryName} (Verified Pass)`, 78, detailsY + 19)

  // 7. Tear-off ticket stub line (Dotted)
  doc.setDrawColor(75, 85, 99)
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.setLineWidth(0.4)
  doc.line(8, 142, 140, 142)

  // Clear dash pattern
  doc.setLineDashPattern([], 0)

  // Tear tag text
  doc.setFont("Courier", "bold")
  doc.setFontSize(7)
  doc.setTextColor(156, 163, 175)
  doc.text("GATE ENTRY VERIFICATION STUB", 74, 140, { align: "center" })

  // 8. QR Code Block
  try {
    const qrUrl = await QRCode.toDataURL(data.ticketCode, {
      margin: 1,
      width: 256,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
    doc.setFillColor(255, 255, 255)
    doc.rect(53, 147, 42, 42, "F")
    doc.addImage(qrUrl, "PNG", 54, 148, 40, 40)
  } catch (err) {
    console.error("Failed to generate QR Code for server PDF ticket:", err)
  }

  // Stub text info
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(data.eventTitle.toUpperCase(), 74, 195, { align: "center" })
  doc.setFont("Courier", "normal")
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text(`TICKET: ${data.ticketCode}`, 74, 200, { align: "center" })

  // Output as raw base64 string
  try {
    const buffer = doc.output("arraybuffer")
    return Buffer.from(buffer).toString("base64")
  } catch (e) {
    const binary = doc.output()
    return Buffer.from(binary, "binary").toString("base64")
  }
}

/**
 * Certificate Utility Functions
 * Placeholder resolution, certificate number generation, verification URLs
 */

/**
 * Replace dynamic placeholders in a string template.
 * Example: "CRA-2026-{{event_id}}-{{user_id}}" → "CRA-2026-abc123-def456"
 */
export function resolvePlaceholders(
  template: string,
  data: Record<string, string | undefined>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || `{{${key}}}`)
}

/**
 * Generate a unique human-readable certificate number.
 */
export function generateCertificateNumber(
  format: string,
  eventId: string,
  userId: string
): string {
  const shortEvent = eventId.substring(0, 8).toUpperCase()
  const shortUser = userId.substring(0, 6).toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)

  const resolved = resolvePlaceholders(format, {
    event_id: shortEvent,
    user_id: shortUser,
    timestamp,
    year: new Date().getFullYear().toString(),
  })

  return resolved
}

/**
 * Build the public verification URL for a certificate.
 */
export function generateVerificationUrl(certId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/verify/${certId}`
}

/**
 * Get a human-readable label for certificate type.
 */
export function getCertTypeLabel(certType: string): string {
  switch (certType) {
    case "winner":
      return "Winner"
    case "runner_up":
      return "Runner Up"
    case "volunteer":
      return "Volunteer"
    case "organizer":
      return "Organizer"
    default:
      return "Participation"
  }
}

/**
 * Format a date string to a readable format.
 */
export function formatCertDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

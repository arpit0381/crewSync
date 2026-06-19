import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Settings, ShieldCheck, Mail, Cloud, ToggleLeft, ToggleRight, Save, Key, Building } from "lucide-react"

export const dynamic = "force-dynamic"

const DEFAULT_SETTINGS = {
  college_name: "Crew University",
  maintenance_mode: "false",
  cloudinary_event_folder: "banners",
  cloudinary_template_folder: "templates",
  smtp_sender: "notifications@crewarena.com"
}

// Server Action inside the settings page
async function updateSettings(formData: FormData) {
  "use server"
  const collegeName = formData.get("college_name") as string
  const maintenance = formData.get("maintenance_mode") === "true" ? "true" : "false"
  const cloudEvents = formData.get("cloudinary_event_folder") as string
  const cloudTemplates = formData.get("cloudinary_template_folder") as string
  const smtpSender = formData.get("smtp_sender") as string

  try {
    const supabase = await createClient()

    const upserts = [
      { key: "college_name", value: collegeName, description: "Name of the institution" },
      { key: "maintenance_mode", value: maintenance, description: "Maintenance mode state" },
      { key: "cloudinary_event_folder", value: cloudEvents, description: "Cloudinary directory for event banner uploads" },
      { key: "cloudinary_template_folder", value: cloudTemplates, description: "Cloudinary directory for certificate templates" },
      { key: "smtp_sender", value: smtpSender, description: "SMTP Sender address" }
    ]

    for (const u of upserts) {
      await supabase
        .from("settings")
        .upsert(u, { onConflict: "key" })
    }

    revalidatePath("/admin/settings")
  } catch (err: any) {
    console.error("Error updating settings:", err)
  }
}

export default async function AdminSettingsPage() {
  let dbSettings = { ...DEFAULT_SETTINGS }

  try {
    const supabase = await createClient()
    const { data } = await supabase.from("settings").select("key, value")
    
    if (data && data.length > 0) {
      data.forEach((s) => {
        if (s.key in dbSettings) {
          (dbSettings as any)[s.key] = s.value
        }
      })
    }
  } catch (err) {
    console.warn("Using default settings due to DB connection:", err)
  }

  const settings = dbSettings

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">System Configurations</h1>
        <p className="text-sm text-muted-foreground">Configure mail delivery settings, media assets storage path keys, and maintenance states.</p>
      </div>

      <form action={updateSettings} className="grid gap-6 md:grid-cols-3">
        {/* Left Card: General Config */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Building className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">General & Branding</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campus Institution Name</label>
              <input
                name="college_name"
                type="text"
                defaultValue={settings.college_name}
                required
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Maintenance Mode</label>
              <select
                name="maintenance_mode"
                defaultValue={settings.maintenance_mode}
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
              >
                <option value="false">Live (Accept Registrations)</option>
                <option value="true">Under Maintenance (Read-Only)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-border pb-4 pt-4">
            <Cloud className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Cloudinary Folders Config</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Banner Directory Folder</label>
              <input
                name="cloudinary_event_folder"
                type="text"
                defaultValue={settings.cloudinary_event_folder}
                required
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Certificates Template Folder</label>
              <input
                name="cloudinary_template_folder"
                type="text"
                defaultValue={settings.cloudinary_template_folder}
                required
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-border pb-4 pt-4">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Resend SMTP Mailing</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sender Verification Address</label>
            <input
              name="smtp_sender"
              type="email"
              defaultValue={settings.smtp_sender}
              required
              className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Right Card: Control Center Info */}
        <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">Actions Console</h2>
            
            <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
              <p>Verify that SMTP credentials and Cloudinary tokens match the workspace configurations in the [.env.local](file:///e:/my%20stuf/crewarena/.env.local) file.</p>
              <p>Maintenance mode will disable registrations across all published technical and sports events for students, keeping dashboard modules in display-only state.</p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-border">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Save Settings Layout
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

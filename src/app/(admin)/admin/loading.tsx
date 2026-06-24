import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
      <div className="p-4 rounded-full bg-primary/10 text-primary animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-bold text-foreground">Loading Data</h2>
        <p className="text-sm text-muted-foreground">Fetching latest records from the database...</p>
      </div>
    </div>
  )
}

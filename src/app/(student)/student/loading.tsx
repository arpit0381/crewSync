import { Loader } from "@/components/loader"

export default function StudentLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-center">
        <Loader />
      </div>
      <div className="space-y-1.5 text-center">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Loading Your Dashboard</h2>
        <p className="text-sm text-muted-foreground">Fetching your tickets and registrations...</p>
      </div>
    </div>
  )
}

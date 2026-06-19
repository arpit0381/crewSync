import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Gamepad, Key, ShieldAlert, ArrowUpRight, Plus, Eye, Monitor } from "lucide-react"

export const dynamic = "force-dynamic"

const MOCK_ESPORTS = [
  {
    id: "esports-mock-1",
    game_name: "Valorant (Campus Arena)",
    type: "knockout",
    status: "ongoing",
    event_title: "Campus Valorant Championship",
    room_id: "VAL-ROOM-55",
    room_password: "secret_spike",
    teams_count: 8
  },
  {
    id: "esports-mock-2",
    game_name: "BGMI Mobile Battle",
    type: "league",
    status: "scheduled",
    event_title: "Logix Esports BGMI Cup",
    room_id: "BGMI-ROOM-202",
    room_password: "drop_pochinki",
    teams_count: 18
  }
]

export default async function AdminEsportsTourneysPage() {
  let dbEsports: any[] = []

  try {
    const supabase = await createClient()
    const { data: tourneys } = await supabase
      .from("esports_tournaments")
      .select(`
        id,
        game_name,
        type,
        status,
        room_id,
        room_password,
        events (
          title
        )
      `)

    if (tourneys && tourneys.length > 0) {
      for (const t of tourneys) {
        // Count teams registered
        const { count: teamsCount } = await supabase
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("event_id", t.id)

        const eventObj = Array.isArray(t.events) ? t.events[0] : t.events

        dbEsports.push({
          id: t.id,
          game_name: t.game_name,
          type: t.type,
          status: t.status,
          room_id: t.room_id || "NOT GENERATED YET",
          room_password: t.room_password || "N/A",
          event_title: eventObj?.title || "Esports Event",
          teams_count: teamsCount || 0
        })
      }
    }
  } catch (err) {
    console.warn("Using mock esports tourneys due to DB connection:", err)
  }

  const esports = dbEsports.length > 0 ? dbEsports : MOCK_ESPORTS

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Esports Tournament Board</h1>
          <p className="text-sm text-zinc-400">Manage game rooms, lobby credentials, game formats, and leaderboards.</p>
        </div>
        <Link
          href="/tournament/matches?action=create-room"
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20"
        >
          <Plus className="h-4 w-4" />
          Dispatch Room ID
        </Link>
      </div>

      {/* Lobbies Grid */}
      {esports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500 bg-zinc-900/10">
          <Gamepad className="h-12 w-12 mx-auto text-zinc-700 mb-2" />
          <p>No active esports lobbies found.</p>
          <p className="text-xs text-zinc-600 mt-1">Create an esports category event to configure lobby credentials.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {esports.map((game) => (
            <div
              key={game.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group hover:border-zinc-750 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      Esports Lobbies
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight mt-1">{game.game_name}</h3>
                    <p className="text-xs text-zinc-500 font-medium">{game.event_title}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    game.status === "ongoing"
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      : game.status === "completed"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-950 border border-zinc-800 text-zinc-500"
                  }`}>
                    <Monitor className="h-3 w-3 shrink-0" />
                    {game.status}
                  </span>
                </div>

                {/* Room Info Cards */}
                <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-4 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Gamepad className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      Lobby ID:
                    </span>
                    <span className="text-white font-bold select-all">{game.room_id}</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Key className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      Password:
                    </span>
                    <span className="text-white font-bold select-all">{game.room_password}</span>
                  </div>
                </div>

                {/* Team Info */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Registered Roster size:</span>
                  <span className="font-bold text-white">{game.teams_count} Teams</span>
                </div>
              </div>

              {/* Configure Link */}
              <div className="mt-6 pt-4 border-t border-zinc-850 flex justify-between">
                <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-500 shrink-0" />
                  Do not share room credentials in public channels.
                </div>
                
                <Link
                  href={`/tournament?id=${game.id}`}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-950 border border-zinc-850 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-900 transition-all cursor-pointer hover:border-zinc-700"
                >
                  Spectate Lobby
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

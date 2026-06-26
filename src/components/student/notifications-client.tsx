"use client"

import * as React from "react"
import { Bell, Check, Loader2, Info, AlertTriangle, Calendar, CheckCircle2 } from "lucide-react"
import { getNotificationsAction, markAllNotificationsAsReadAction, markNotificationAsReadAction } from "@/app/notification-actions"
import { createClient } from "@/lib/supabase/client"

export function NotificationsClient() {
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const playNotificationSound = React.useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Ignore autoplay policy errors silently
    }
  }, [])

  const fetchNotifications = async () => {
    const res = await getNotificationsAction()
    if (res.notifications) {
      setNotifications(res.notifications)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    fetchNotifications()
    
    const supabase = createClient()
    let channel: any

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      channel = supabase
        .channel('realtime:notifications-page')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            playNotificationSound()
            setNotifications((current) => [payload.new, ...current])
          }
        )
        .subscribe()
    })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read_at).length

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsAsReadAction()
    if (res.success) {
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })))
    }
  }

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationAsReadAction(id)
    if (res.success) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "event": return <Calendar className="h-5 w-5 text-blue-500" />
      case "alert": return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-primary" />
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-2">View all your platform alerts, reminders, and updates.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card/20 backdrop-blur-sm overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-bold">You're all caught up!</h3>
            <p className="text-muted-foreground mt-1">You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-6 transition-colors flex gap-4 items-start ${!n.read_at ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-card/40'}`}
              >
                <div className="shrink-0 mt-1 h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`text-lg md:text-xl truncate ${!n.read_at ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                      {n.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap pt-1 font-medium bg-background px-2 py-1 rounded-md border border-border/50 hidden sm:inline-block">
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium sm:hidden block mb-2">
                    {formatTime(n.created_at)}
                  </span>
                  <p className={`mt-2 leading-relaxed ${!n.read_at ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                    {n.message}
                  </p>
                </div>
                
                {!n.read_at && (
                  <button 
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 ml-2 rounded-full p-2 bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/10 transition-all shadow-sm"
                    title="Mark as read"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

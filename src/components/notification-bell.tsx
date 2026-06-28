"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, Check, Loader2 } from "lucide-react"
import { getNotificationsAction, markAllNotificationsAsReadAction, markNotificationAsReadAction } from "@/app/notification-actions"
import { createClient } from "@/lib/supabase/client"

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const popoverRef = React.useRef<HTMLDivElement>(null)

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
    let isMounted = true

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !isMounted) return

      // Use a more unique channel name just in case
      channel = supabase
        .channel(`user-notifications-${user.id}`)
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
      isMounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read_at).length
  const unreadNotifications = notifications.filter(n => !n.read_at).slice(0, 5)

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsAsReadAction()
    if (res.success) {
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })))
    }
  }

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const res = await markNotificationAsReadAction(id)
    if (res.success) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-card/50 transition-colors"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </button>

      {isOpen && (
        <div className="fixed top-16 left-4 right-4 md:absolute md:top-full md:left-auto md:right-0 md:mt-2 w-auto md:w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {loading ? (
              <div className="p-8 flex justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : unreadNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">You have no new notifications.</div>
            ) : (
              <div className="space-y-1">
                {unreadNotifications.map((n) => (
                  <div 
                    key={n.id} 
                    className="p-3 rounded-xl flex gap-3 transition-colors bg-primary/5 hover:bg-primary/10"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm truncate font-bold text-foreground">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">
                          {formatTime(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs mt-1 line-clamp-2 text-foreground/80">
                        {n.message}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="mt-1 h-5 w-5 shrink-0 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-border bg-card/50 text-center">
            <Link 
              href="/student/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

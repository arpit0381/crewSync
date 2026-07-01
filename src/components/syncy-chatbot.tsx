"use client"

import * as React from "react"
import { useState, useEffect, useRef, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageSquare, 
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCw,
  Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { askSyncyAction } from "@/app/syncy-actions"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

export function SyncyChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [unreadCount, setUnreadCount] = useState(1)
  const [userContext, setUserContext] = useState<{ id: string; name: string; role: string; email: string } | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatbotRef = useRef<HTMLDivElement>(null)

  // Load user context
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserContext({
          id: user.id,
          name: user.user_metadata?.name || "Student",
          role: user.user_metadata?.role || "student",
          email: user.email || ""
        })
      }
    })
  }, [])

  // Welcome message on load
  useEffect(() => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `👋 Hi! I'm **Syncy**, your Crew Sync AI assistant. I can help you discover events, register for competitions, manage certificates, explain platform features, and answer questions. How can I help you today?`,
        timestamp: time
      }
    ])
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isPending])

  // Clear unread count when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: time
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue("")

    const historyPayload = messages.map(m => ({
      role: m.role,
      content: m.content
    }))

    startTransition(async () => {
      const result = await askSyncyAction(text, historyPayload, userContext)
      const assistantMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, assistantMsg])
    })
  }

  const handleRegenerate = () => {
    // Find the last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user")
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content)
    }
  }

  // Simple safe markdown to HTML parser
  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Bullet points (• text or * text)
    html = html.split('\n').map(line => {
      if (line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2)
        return `<li class="ml-4 list-disc my-1">${content}</li>`
      }
      return line
    }).join('\n')

    // Links ([text](url))
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a class="text-primary hover:underline font-semibold" href="$2">$1</a>')

    // Newlines
    html = html.replace(/\n/g, "<br/>")

    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-sm leading-relaxed" />
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const quickActions = [
    { label: "Show today's events", icon: "📅" },
    { label: "My registrations", icon: "🎫" },
    { label: "My certificates", icon: "🏆" },
    { label: "Sports tournaments", icon: "🏀" },
    { label: "How QR attendance works", icon: "🔍" }
  ]

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3 font-sans select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatbotRef}
            drag
            dragMomentum={false}
            dragConstraints={{ left: -1000, right: 0, top: -800, bottom: 0 }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`flex flex-col overflow-hidden rounded-3xl border border-border/30 bg-card/60 backdrop-blur-xl shadow-2xl transition-all duration-300 w-[calc(100vw-32px)] sm:w-[380px] shrink-0 ${
              isMinimized ? "h-auto" : "h-[480px] md:h-[550px]"
            }`}
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border/20 px-4 bg-gradient-to-r from-primary/10 via-background/40 to-background/40">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/50 shadow-md">
                  <img 
                    src="/icons/syncy.png" 
                    alt="Syncy Mascot" 
                    className="h-7 w-7 object-contain animate-pulse" 
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Syncy</h3>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Campus Companion</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)} 
                  className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-all"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-all"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Minimize state content */}
            {!isMinimized && (
              <>
                {/* Conversation area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 max-w-[85%] ${
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm border ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground border-primary/20"
                            : "bg-muted/40 text-foreground border-border/20"
                        }`}
                      >
                        {renderMarkdown(msg.content)}
                      </div>
                      
                      <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                        <span>{msg.timestamp}</span>
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => copyToClipboard(msg.content)} className="hover:text-foreground">
                              <Copy className="h-3 w-3" />
                            </button>
                            <button className="hover:text-foreground">
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button className="hover:text-foreground">
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isPending && (
                    <div className="flex items-center gap-2 max-w-[85%] mr-auto bg-muted/40 text-foreground border border-border/20 rounded-2xl px-4 py-3 shadow-sm">
                      <span className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick actions chips */}
                <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-border/15 scrollbar-none">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(action.label)}
                      className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border/30 bg-muted/50 hover:bg-muted/95 px-3 py-1 text-xs font-semibold transition-all hover:scale-[1.02]"
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage(inputValue)
                  }}
                  className="flex items-center gap-2 border-t border-border/20 p-3 bg-gradient-to-b from-background/40 to-background/70"
                >
                  <input
                    type="text"
                    placeholder="Ask Syncy..."
                    className="flex-1 rounded-xl border border-border/30 bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isPending || !inputValue.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                  {messages.length > 1 && (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all shrink-0"
                      title="Regenerate last response"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                  )}
                </form>

                {/* Footer */}
                <div className="flex justify-center border-t border-border/10 py-1.5 bg-muted/20">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Powered by Syncy Engine</span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Column containing button + tooltip */}
      <div className="flex flex-col items-center gap-2">
        {/* Floating Action Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0], transition: { duration: 0.4 } }}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center transition-all focus:outline-none group cursor-pointer shrink-0"
          aria-label="Open Syncy Assistant"
        >
          <img 
            src="/icons/syncy.png" 
            alt="Syncy Mascot" 
            className="h-14 w-14 md:h-16 md:w-16 object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(59,130,246,0.35)]" 
          />
          {unreadCount > 0 && !isOpen && (
            <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white border border-background animate-pulse">
              {unreadCount}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              transition={{ delay: 1, duration: 0.3 }}
              className="whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-foreground shadow-sm flex items-center gap-1 pointer-events-none"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Hi, I'm Syncy! 👋
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


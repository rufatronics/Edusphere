'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Send,
  Bot,
  User,
  ChevronLeft,
  Trash2,
  Sparkles,
  Brain,
  Zap,
  Plus,
  FileText,
  MoreVertical,
  ShieldAlert
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

function AITutorContent() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mode, setMode] = useState('normal')
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [resource, setResource] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const modes = [
    { id: 'normal', name: 'Standard', icon: <Bot size={16} />, desc: 'General academic support' },
    { id: 'socratic', name: 'Socratic', icon: <Brain size={16} />, desc: 'Guided discovery learning' },
    { id: 'simplify', name: 'Simplify', icon: <Zap size={16} />, desc: 'Explain like I\'m 5' },
  ]

  const currentMode = modes.find(m => m.id === mode) || modes[0]

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setCheckingAuth(false)
        return
      }
      setUser(authUser)
      setCheckingAuth(false)

      const resId = searchParams.get('resource')
      if (resId) {
        const { data } = await supabase.from('resources').select('*').eq('id', resId).single()
        setResource(data)
      }

      const saved = localStorage.getItem('edusphere_ai_chat')
      if (saved) setMessages(JSON.parse(saved))
    }

    checkUser()
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [searchParams])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('edusphere_ai_chat', JSON.stringify(messages))
    }
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode,
          context: resource ? `Document: ${resource.title}. Content: ${resource.content || 'No text extracted yet'}` : null
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Slow down! Please wait 5 seconds between messages.' }])
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting to my brain right now. Please try again.' }])
        }
        return
      }

      setMessages(prev => [...prev, data])
    } catch (error) {
      console.error('AI Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an unexpected error. Check your connection and try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    if (confirm('Clear entire conversation history?')) {
      setMessages([])
      localStorage.removeItem('edusphere_ai_chat')
    }
  }

  if (checkingAuth) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
       <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-[2rem] flex items-center justify-center mb-8 text-emerald-500 shadow-2xl shadow-emerald-500/10">
          <ShieldAlert size={40} />
       </div>
       <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Online Access Required</h1>
       <p className="text-zinc-500 max-w-sm mb-10 font-medium leading-relaxed uppercase text-[10px] tracking-widest">
         AI Tutor uses secure cloud processing and requires an authenticated BUK account to prevent system abuse.
       </p>
       <div className="flex flex-col w-full max-w-xs gap-4">
         <Link href="/login" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">
           Sign In
         </Link>
         <Link href="/dashboard" className="w-full border border-zinc-800 py-4 rounded-2xl font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
           Return Home
         </Link>
       </div>
    </div>
  )

  return (
    <div className="h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-4 md:px-10 md:py-8 border-b border-zinc-900/50 bg-black/50 backdrop-blur-xl flex justify-between items-center z-30">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/dashboard" className="p-1.5 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500">
            <ChevronLeft size={isMobile ? 18 : 20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-9 md:h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot size={isMobile ? 16 : 20} className="text-black" />
            </div>
            <div>
              <h1 className="font-black text-[10px] md:text-sm tracking-tighter uppercase leading-none mb-0.5">EduSphere AI</h1>
              <p className="text-[8px] md:text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> {currentMode.name} Active
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {resource && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
              <FileText size={10} /> {resource.title.slice(0, 15)}...
            </div>
          )}
          <button onClick={clearChat} className="p-2.5 text-zinc-600 hover:text-red-500 transition-colors" title="Clear Chat">
            <Trash2 size={isMobile ? 18 : 20} />
          </button>
          <button className="p-2.5 text-zinc-600 hover:text-white transition-colors">
            <MoreVertical size={isMobile ? 18 : 20} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-12 md:py-10 scrollbar-hide">
        <div className="max-w-4xl mx-auto w-full space-y-8 md:space-y-12">

          {messages.length === 0 && (
            <div className="py-20 text-center space-y-6 opacity-20 select-none">
               <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-zinc-800">
                  <Bot size={48} />
               </div>
               <h2 className="text-2xl font-black uppercase tracking-widest">Awaiting Command</h2>
               <p className="text-xs font-bold uppercase tracking-[0.3em]">Advanced Academic Intelligence Engine</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 md:gap-8 max-w-[95%] md:max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 md:w-11 md:h-11 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-xl ${
                    m.role === 'user' ? 'bg-zinc-100 text-black border-zinc-200' : 'bg-emerald-500 text-black border-emerald-400'
                  }`}>
                    {m.role === 'user' ? <User size={isMobile ? 18 : 22} /> : <Bot size={isMobile ? 18 : 22} />}
                  </div>
                  <div className={`px-6 py-5 md:px-8 md:py-6 rounded-[1.8rem] text-sm md:text-base leading-relaxed shadow-2xl ${
                    m.role === 'user'
                      ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tr-none'
                      : 'bg-zinc-900/40 text-emerald-50 border border-zinc-800/40 rounded-tl-none backdrop-blur-md'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-emerald-500 text-black rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
                  <Bot size={18} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} className="h-10" />
        </div>
      </main>

      {/* Input Area */}
      <div className="px-4 pb-8 pt-4 md:px-14 md:pb-14 md:pt-6 border-t border-zinc-900/50 bg-black/90 backdrop-blur-2xl z-30">
        <div className="max-w-4xl mx-auto relative">

          <AnimatePresence>
            {showModeMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowModeMenu(false)}
                  className="fixed inset-0 bg-black/80 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 100 : 10, scale: isMobile ? 1 : 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: isMobile ? 100 : 10, scale: isMobile ? 1 : 0.95 }}
                  className={`absolute ${isMobile ? 'fixed bottom-0 left-0 right-0 rounded-t-[3rem] w-full' : 'bottom-full left-0 mb-6 w-80 rounded-[2rem]'} bg-zinc-950 border border-zinc-800 p-8 shadow-2xl z-50 overflow-hidden`}
                >
                  <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Intelligence Mode</p>
                    {isMobile && <button onClick={() => setShowModeMenu(false)} className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Close</button>}
                  </div>
                  <div className="space-y-3">
                    {modes.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setMode(m.id); setShowModeMenu(false); }}
                        className={`w-full p-5 rounded-2xl text-left flex flex-col transition-all active:scale-95 ${
                          mode === m.id
                            ? 'bg-emerald-500 text-black shadow-xl shadow-emerald-500/10'
                            : 'bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 border border-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 font-black text-[13px] uppercase tracking-tight">
                          {m.icon} {m.name}
                        </div>
                        <p className={`text-[10px] font-bold mt-1.5 uppercase tracking-widest ${mode === m.id ? 'text-black/60' : 'text-zinc-600'}`}>{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.2rem] overflow-hidden focus-within:border-emerald-500/30 focus-within:ring-8 focus-within:ring-emerald-500/5 transition-all shadow-inner relative group">

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={mode === 'socratic' ? "How can I help you think?" : "Ask EduSphere AI anything..."}
              className="w-full bg-transparent pl-16 pr-16 py-5 md:py-6 text-sm md:text-base text-white placeholder:text-zinc-600 focus:outline-none resize-none min-h-[64px] max-h-[250px] font-medium"
            />

            <div className="absolute left-3 top-1/2 -translate-y-1/2">
               <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="w-11 h-11 bg-zinc-900/80 border border-zinc-800 text-zinc-500 rounded-2xl flex items-center justify-center hover:text-emerald-400 hover:border-emerald-500/20 transition-all active:scale-90"
              >
                {currentMode.icon}
              </button>
            </div>

            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-11 h-11 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-90 disabled:opacity-20 disabled:grayscale shadow-xl"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6">
             <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                <Zap size={10} className="text-emerald-500" /> BUK-ACADEMY-AI
             </div>
             <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
             <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                <Link href="/resources" className="hover:text-emerald-500 transition-colors">Shared Resources</Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AITutor() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AITutorContent />
    </Suspense>
  )
}

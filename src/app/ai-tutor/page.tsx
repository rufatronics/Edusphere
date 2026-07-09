'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Bot,
  User,
  Send,
  ChevronLeft,
  Trash2,
  Settings,
  HelpCircle,
  Sparkles,
  Zap,
  Maximize2,
  FileText,
  ArrowRight,
  Plus,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function AITutorContent() {
  const searchParams = useSearchParams()
  const resourceId = searchParams.get('resource')
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('normal')
  const [resource, setResource] = useState<any>(null)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  // Detection of mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (resourceId) {
      supabase.from('resources').select('*').eq('id', resourceId).single().then(async ({ data }) => {
        if (data) {
          try {
            const res = await fetch(data.file_url)
            if (res.ok) {
              const text = await res.text()
              setResource({ ...data, content: text.slice(0, 10000) })
              setMessages([{ role: 'assistant', content: `I've analyzed "${data.title}". I'm ready to answer questions about it!` }])
            }
          } catch (e) {
            console.error('Failed to fetch document content', e)
          }
        }
      })
    }
    const savedChat = localStorage.getItem('edusphere_ai_chat')
    if (savedChat) {
      setMessages(JSON.parse(savedChat))
    } else {
      if (!resourceId) {
        setMessages([{ role: 'assistant', content: 'Hello! I am your EduSphere AI Tutor. How can I help you with your BUK studies today?' }])
      }
    }
  }, [resourceId, supabase])

  useEffect(() => {
    localStorage.setItem('edusphere_ai_chat', JSON.stringify(messages))
    if (scrollRef.current) {
       scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || loading) return

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
      setMessages(prev => [...prev, data])
    } catch (error) {
      console.error('AI Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you now?' }])
    localStorage.removeItem('edusphere_ai_chat')
  }

  const modes = [
    { id: 'normal', name: 'Standard', icon: <Zap size={isMobile ? 14 : 16} />, desc: 'Quick direct answers' },
    { id: 'socratic', name: 'Socratic', icon: <HelpCircle size={isMobile ? 14 : 16} />, desc: 'Critical thinking' },
    { id: 'simplify', name: 'Simplify', icon: <Sparkles size={isMobile ? 14 : 16} />, desc: 'ELI5 explanations' },
  ]

  const currentMode = modes.find(m => m.id === mode) || modes[0]

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
      {/* Header - More compact on mobile */}
      <header className="px-3 py-2 md:px-6 md:py-4 border-b border-zinc-900 flex justify-between items-center bg-black/80 backdrop-blur-xl z-20 sticky top-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/dashboard" className="p-1.5 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500">
            <ChevronLeft size={isMobile ? 18 : 20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-9 md:h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
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
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[8px] md:text-[10px] font-bold uppercase">
              <FileText size={10} /> {resource.title.slice(0, 10)}...
            </div>
          )}
          <button onClick={clearChat} className="p-2 text-zinc-600 hover:text-red-500 transition-colors" title="Clear Chat">
            <Trash2 size={isMobile ? 16 : 18} />
          </button>
          <button className="p-2 text-zinc-600 hover:text-white transition-colors">
            <MoreVertical size={isMobile ? 16 : 18} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-3 py-4 md:px-12 md:py-10 scrollbar-hide">
        <div className="max-w-3xl mx-auto w-full space-y-5 md:space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2.5 md:gap-5 max-w-[95%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex-shrink-0 flex items-center justify-center border ${
                    m.role === 'user' ? 'bg-zinc-100 text-black border-zinc-200' : 'bg-emerald-500 text-black border-emerald-400'
                  }`}>
                    {m.role === 'user' ? <User size={isMobile ? 14 : 18} /> : <Bot size={isMobile ? 14 : 18} />}
                  </div>
                  <div className={`px-3.5 py-2.5 md:px-5 md:py-4 rounded-2xl text-[13px] md:text-base leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tr-none'
                      : 'bg-zinc-900/40 text-emerald-50 border border-zinc-800/40 rounded-tl-none backdrop-blur-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-emerald-500 text-black rounded-full flex items-center justify-center animate-pulse">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </main>

      {/* DeepSeek Style Input Area */}
      <div className="px-3 pb-6 pt-2 md:px-10 md:pb-10 md:pt-4 border-t border-zinc-900/50 bg-black/90 backdrop-blur-2xl z-30">
        <div className="max-w-3xl mx-auto relative">

          {/* Mode Selector - Bottom Sheet style on mobile */}
          <AnimatePresence>
            {showModeMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowModeMenu(false)}
                  className="fixed inset-0 bg-black/60 z-40 md:hidden"
                />
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 100 : 10, scale: isMobile ? 1 : 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: isMobile ? 100 : 10, scale: isMobile ? 1 : 0.95 }}
                  className={`absolute ${isMobile ? 'fixed bottom-0 left-0 right-0 rounded-t-[2rem] w-full' : 'bottom-full left-0 mb-4 w-64 rounded-[1.5rem]'} bg-zinc-950 border border-zinc-800 p-4 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden`}
                >
                  <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Thought Process</p>
                    {isMobile && <button onClick={() => setShowModeMenu(false)} className="text-zinc-500 text-xs font-bold uppercase">Done</button>}
                  </div>
                  <div className="space-y-1.5">
                    {modes.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setMode(m.id); setShowModeMenu(false); }}
                        className={`w-full p-3.5 rounded-xl text-left flex flex-col transition-all ${
                          mode === m.id
                            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                            : 'hover:bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 font-bold text-[13px]">
                          {m.icon} {m.name}
                        </div>
                        <p className={`text-[10px] mt-0.5 ${mode === m.id ? 'text-black/70' : 'text-zinc-600'}`}>{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">

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
              className="w-full bg-transparent pl-12 pr-12 py-3.5 md:pb-4 md:pr-14 text-sm md:text-base text-white placeholder:text-zinc-600 focus:outline-none resize-none min-h-[56px] max-h-[200px]"
            />

            <div className="absolute left-2 top-1/2 -translate-y-1/2 md:relative md:left-0 md:bottom-0 md:flex md:items-center md:px-3 md:pb-2">
               <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-none p-2 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95"
              >
                {currentMode.icon}
                <span className="hidden">{isMobile ? currentMode.name : 'Change Strategy'}</span>
              </button>
            </div>

            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 md:w-11 md:h-11 bg-white text-black rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-90 disabled:opacity-30 disabled:grayscale"
              >
                <Send size={isMobile ? 18 : 20} />
              </button>
            </div>
          </div>

          {!isMobile && (
            <div className="mt-3 flex items-center justify-center gap-4">
               <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                  <Zap size={10} className="text-emerald-500" /> BUK-NODE-PRIMARY
               </div>
               <div className="w-1 h-1 bg-zinc-800 rounded-full" />
               <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                  <Link href="/resources" className="hover:text-emerald-500 flex items-center gap-1">
                     <Plus size={10} /> Shared Materials
                  </Link>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AITutor() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AITutorContent />
    </Suspense>
  )
}

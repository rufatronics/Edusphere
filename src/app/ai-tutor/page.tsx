'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bot,
  User,
  Trash2,
  Zap,
  Sparkles,
  HelpCircle,
  ChevronLeft,
  ArrowRight,
  Maximize2,
  Settings,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AITutor() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AITutorContent />
    </Suspense>
  )
}

function AITutorContent() {
  const searchParams = useSearchParams()
  const resourceId = searchParams.get('resource')
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('normal')
  const [resource, setResource] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (resourceId) {
      supabase.from('resources').select('*').eq('id', resourceId).single().then(({ data }) => {
        setResource(data)
        if (data) {
          setMessages([{ role: 'assistant', content: `I've loaded "${data.title}". How can I help you understand this document?` }])
        }
      })
    }
    const savedChat = localStorage.getItem('edusphere_ai_chat')
    if (savedChat) {
      setMessages(JSON.parse(savedChat))
    } else {
      setMessages([{ role: 'assistant', content: 'Hello! I am your EduSphere AI Tutor. How can I help you with your BUK studies today?' }])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('edusphere_ai_chat', JSON.stringify(messages))
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you now?' }])
    localStorage.removeItem('edusphere_ai_chat')
  }

  const modes = [
    { id: 'normal', name: 'Standard', icon: <Zap size={16} />, desc: 'Quick direct answers' },
    { id: 'socratic', name: 'Socratic', icon: <HelpCircle size={16} />, desc: 'Critical thinking' },
    { id: 'simplify', name: 'Simplify', icon: <Sparkles size={16} />, desc: 'ELI5 explanations' },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      {/* AI Sidebar / Controls */}
      <aside className="w-full lg:w-80 border-r border-zinc-900 flex flex-col p-6 bg-zinc-950">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Bot size={20} className="text-black" />
            </div>
            <h1 className="font-black tracking-tighter uppercase">Intelligence</h1>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Select Interaction Mode</p>
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`w-full p-4 rounded-2xl border transition-all text-left group ${
                mode === m.id
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-tight">
                  {m.icon} {m.name}
                </div>
                {mode === m.id && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
              </div>
              <p className="text-[11px] opacity-70">{m.desc}</p>
            </button>
          ))}
        </div>

        <div className="pt-6 border-t border-zinc-900 space-y-2">
          <button onClick={clearChat} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-colors text-xs font-bold uppercase">
            <Trash2 size={16} /> Reset Memory
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-900 transition-colors text-xs font-bold uppercase">
            <Settings size={16} /> AI Parameters
          </button>
        </div>
      </aside>

      {/* Main Chat Engine */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Chat Header */}
        <header className="p-6 border-b border-zinc-900 flex justify-between items-center bg-black/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight uppercase">AI Academic Tutor</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full" /> Llama 3.3 Active
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {resource && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase">
                <FileText size={12} /> {resource.title}
              </div>
            )}
            <button className="p-2 text-zinc-500 hover:text-white"><Maximize2 size={18} /></button>
          </div>
        </header>

        {/* Messages Space */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-6 max-w-2xl ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border ${
                    m.role === 'user' ? 'bg-zinc-100 text-black border-zinc-200' : 'bg-emerald-500 text-black border-emerald-400'
                  }`}>
                    {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-6 rounded-[2rem] text-sm md:text-base leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tr-none'
                      : 'bg-zinc-900/40 text-emerald-50 border border-zinc-800/50 rounded-tl-none backdrop-blur-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center animate-pulse">
                  <Bot size={20} />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} className="h-24" />
        </div>

        {/* Floating Input Area */}
        <div className="p-6 md:p-10 border-t border-zinc-900 bg-black/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              placeholder={mode === 'socratic' ? "Ask me to help you solve something..." : "Ask an academic question..."}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] pl-6 pr-20 py-5 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
            >
              <ArrowRight size={24} />
            </button>
          </div>
          <p className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-4">
            EduSphere BUK • 2026 Intelligence Engine
          </p>
        </div>
      </main>
    </div>
  )
}

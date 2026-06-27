'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Trash2, HelpCircle, Zap, Sparkles } from 'lucide-react'

export default function AITutor() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('normal') // normal, socratic, simplify
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
          mode
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

  return (
    <div className="flex flex-col h-[calc(100-screen-64px)] max-h-[800px] bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto my-4 border border-gray-100">
      {/* Header */}
      <header className="bg-primary p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-bold">EduSphere AI Tutor</h1>
            <p className="text-xs text-green-100">Llama 3 Powered • 24/7 Assistance</p>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Trash2 size={20} />
        </button>
      </header>

      {/* Mode Selector */}
      <div className="flex p-2 bg-gray-50 border-b gap-2 overflow-x-auto">
        <button
          onClick={() => setMode('normal')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${mode === 'normal' ? 'bg-primary text-white' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}
        >
          <Zap size={14} /> Normal
        </button>
        <button
          onClick={() => setMode('socratic')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${mode === 'socratic' ? 'bg-primary text-white' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}
        >
          <HelpCircle size={14} /> Socratic Mode
        </button>
        <button
          onClick={() => setMode('simplify')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${mode === 'simplify' ? 'bg-primary text-white' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}
        >
          <Sparkles size={14} /> Simplify (ELI5)
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`p-2 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="p-2 rounded-full h-8 w-8 bg-gray-200 text-gray-600 flex items-center justify-center animate-pulse">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-tl-none italic animate-pulse">
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={mode === 'socratic' ? "Ask me to help you solve something..." : "Ask an academic question..."}
            className="flex-1 p-2 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-primary text-white p-2 rounded-xl hover:bg-opacity-90 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

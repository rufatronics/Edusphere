'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Send,
  Users,
  ChevronLeft,
  Shield,
  Clock,
  Check,
  CheckCheck,
  Info
} from 'lucide-react'
import Link from 'next/link'

export default function GroupChatPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchGroupData()
    })
  }, [groupId])

  const fetchGroupData = async () => {
    const { data: groupData } = await supabase.from('groups').select('*').eq('id', groupId).single()
    setGroup(groupData)
    if (groupData) fetchMessages()
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(full_name)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
    setLoading(false)

    // Subscribe to group messages
    const channel = supabase
      .channel(`group:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`
      }, (payload) => {
        setMessages(prev => {
           if (prev.find(m => m.id === payload.new.id)) return prev
           return [...prev, payload.new]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !user) return
    const tempInput = input
    setInput('')

    const { error } = await supabase.from('messages').insert([
      { sender_id: user.id, group_id: groupId, content: tempInput }
    ])

    if (error) {
      console.error(error)
      setInput(tempInput)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-zinc-900 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/groups" className="p-2 text-zinc-500 hover:text-white transition-colors"><ChevronLeft size={20} /></Link>
          <div className="relative">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-emerald-500 border border-zinc-800">
              <Users size={24} />
            </div>
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-tight">{group?.name || 'Loading Circle...'}</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Collaborative Hub</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="p-2 text-zinc-500 hover:text-white"><Info size={20} /></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center mb-10">
          <div className="max-w-md text-center space-y-4">
             <div className="inline-flex bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest gap-2 mx-auto">
                <Shield size={12} className="text-emerald-500" /> Ephemeral Peer Network
             </div>
             <p className="text-xs text-zinc-600 font-medium">{group?.description}</p>
          </div>
        </div>

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] ${m.sender_id === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
              {m.sender_id !== user?.id && (
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter mb-1 ml-1">
                  {m.profiles?.full_name || 'Student'}
                </span>
              )}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.sender_id === user?.id
                  ? 'bg-emerald-500 text-black font-medium rounded-tr-none'
                  : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none'
              }`}>
                {m.content}
              </div>
              <div className="flex items-center gap-1.5 mt-2 px-1">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {m.sender_id === user?.id && (
                  m.is_delivered ? <CheckCheck size={12} className="text-emerald-500" /> : <Check size={12} className="text-zinc-600" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} className="h-10" />
      </div>

      {/* Input */}
      <div className="p-6 md:p-10 border-t border-zinc-900 bg-black/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            placeholder="Broadcast to circle..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95 flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
          <span className="flex items-center gap-1"><Clock size={10} /> AUTO-PURGE ENABLED</span>
          <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
          <span>CIRCLE ID: {groupId.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Send,
  Search,
  MessageCircle,
  Shield,
  Clock,
  Check,
  CheckCheck,
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Trash2,
  ShieldAlert
} from 'lucide-react'
import Link from 'next/link'
import { MobileNav } from '@/components/MobileNav'
import { usePresence } from '@/hooks/usePresence'
import { motion } from 'framer-motion'

export default function PersonalChatPage() {
  const [users, setUsers] = useState<any[]>([])
  const [recipient, setRecipient] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isUserOnline } = usePresence()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setCheckingAuth(false)
        return
      }
      setUser(authUser)
      setCheckingAuth(false)
      fetchUsers(authUser.id)
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (!user || !recipient) return
    fetchMessages()

    const channel = supabase
      .channel(`personal:${user.id}:${recipient.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        if (
          (payload.new.sender_id === recipient.id && payload.new.receiver_id === user.id) ||
          (payload.new.sender_id === user.id && payload.new.receiver_id === recipient.id)
        ) {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, recipient])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchUsers = async (currentUserId: string) => {
    const { data } = await supabase.from('profiles').select('*').limit(50)
    setUsers(data?.filter(u => u.id !== currentUserId) || [])
    setLoading(false)
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  const sendMessage = async () => {
    if (!input.trim() || !user || !recipient) return
    const tempInput = input
    setInput('')

    const { error } = await supabase.from('messages').insert([
      { sender_id: user.id, receiver_id: recipient.id, content: tempInput }
    ])

    if (error) {
      console.error('Error sending message:', error)
      setInput(tempInput)
    }
  }

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId)
    if (error) alert('Failed to delete message: ' + error.message)
  }

  if (checkingAuth) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
       <motion.div
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center mb-8 text-purple-500 shadow-2xl shadow-purple-500/10"
       >
          <ShieldAlert size={40} />
       </motion.div>
       <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Encryption Portal</h1>
       <p className="text-zinc-500 max-w-sm mb-10 font-medium leading-relaxed uppercase text-[10px] tracking-widest">
         Private messaging requires secure cryptographic keys linked to your BUK identity. Access restricted to authenticated students.
       </p>
       <div className="flex flex-col w-full max-w-xs gap-4">
         <Link href="/login" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">
           Identity Verification
         </Link>
         <Link href="/dashboard" className="w-full border border-zinc-800 py-4 rounded-2xl font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
           Cancel Protocol
         </Link>
       </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-black text-white flex overflow-hidden">
      {/* Sidebar - Contacts */}
      <aside className={`w-full lg:w-96 border-r border-zinc-900 flex flex-col bg-zinc-950/50 backdrop-blur-xl ${recipient ? 'hidden lg:flex' : 'flex'}`}>
        <header className="p-8 border-b border-zinc-900">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Intelligence</h1>
            <Link href="/dashboard" className="p-2.5 hover:bg-zinc-900 rounded-xl text-zinc-500 transition-colors"><ChevronLeft size={22} /></Link>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input
              type="text"
              placeholder="Locate classmate..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
             <div className="p-10 text-center text-zinc-700 animate-pulse font-black text-[10px] uppercase tracking-[0.3em]">Synching secure nodes...</div>
          ) : users.map(u => (
            <button
              key={u.id}
              onClick={() => setRecipient(u)}
              className={`w-full p-6 flex items-center gap-5 hover:bg-zinc-900/50 rounded-3xl transition-all text-left ${recipient?.id === u.id ? 'bg-zinc-900 shadow-xl border border-zinc-800' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center font-black border border-zinc-700 text-lg shadow-inner">
                  {u.full_name?.[0] || 'U'}
                </div>
                {isUserOnline(u.id) && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-black rounded-full shadow-lg"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-sm uppercase tracking-tight truncate">{u.full_name}</span>
                  <span className="text-[9px] text-zinc-600 font-black uppercase">Active</span>
                </div>
                <div className="text-[10px] text-zinc-500 truncate font-bold uppercase tracking-widest">{u.department} • {u.level}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Engine */}
      <main className={`flex-1 flex flex-col bg-black relative ${!recipient ? 'hidden lg:flex' : 'flex'}`}>
        {recipient ? (
          <>
            <header className="p-4 md:p-8 border-b border-zinc-900 flex justify-between items-center bg-black/50 backdrop-blur-xl z-10">
              <div className="flex items-center gap-5">
                <button onClick={() => setRecipient(null)} className="lg:hidden p-2.5 text-zinc-500 hover:text-white transition-colors bg-zinc-900 rounded-xl"><ChevronLeft size={22} /></button>
                <div className="relative">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-xs border border-zinc-700 shadow-inner">
                    {recipient.full_name?.[0]}
                  </div>
                  {isUserOnline(recipient.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-[3px] border-black rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-black text-sm uppercase tracking-tight leading-none mb-1">{recipient.full_name}</h2>
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isUserOnline(recipient.id) ? 'text-emerald-500' : 'text-zinc-600'}`}>
                    {isUserOnline(recipient.id) ? 'Encrypted Connection' : 'Node Offline'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 text-zinc-500">
                <button className="p-3 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"><Phone size={20} /></button>
                <button className="p-3 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"><MoreVertical size={20} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 scrollbar-hide">
              <div className="flex justify-center mb-12">
                <div className="bg-zinc-900/40 border border-zinc-800/50 px-6 py-2.5 rounded-full text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3 backdrop-blur-sm">
                  <Shield size={14} className="text-emerald-500" /> End-to-end encrypted • AUTO-PURGE ENABLED
                </div>
              </div>

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`group relative max-w-[90%] md:max-w-[75%] ${m.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                    <div className={`p-5 md:p-6 rounded-[1.8rem] text-[13px] md:text-sm leading-relaxed shadow-2xl ${
                      m.sender_id === user?.id
                        ? 'bg-emerald-500 text-black font-black rounded-tr-none'
                        : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none'
                    }`}>
                      {m.content}

                      {m.sender_id === user?.id && (
                        <button
                          onClick={() => deleteMessage(m.id)}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl active:scale-90"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 px-2">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {m.sender_id === user?.id && (
                        m.is_delivered ? <CheckCheck size={14} className="text-emerald-500" /> : <Check size={14} className="text-zinc-700" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} className="h-10" />
            </div>

            <div className="p-6 md:p-14 border-t border-zinc-900 bg-black/80 backdrop-blur-2xl">
              <div className="max-w-4xl mx-auto flex gap-4">
                <input
                  type="text"
                  placeholder="Transmit signal..."
                  className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-8 py-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-90 flex-shrink-0 shadow-2xl"
                >
                  <Send size={24} />
                </button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">
                <span className="flex items-center gap-2"><Clock size={12} /> SECURE PROTOCOL</span>
                <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></span>
                <span>NODE-BUK-ALPHA</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30 select-none">
            <div className="w-32 h-32 bg-zinc-900 border border-zinc-800 rounded-[3rem] flex items-center justify-center mb-10">
              <MessageCircle size={56} className="text-zinc-700" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-3">Silent Engine</h2>
            <p className="text-zinc-500 text-[10px] max-w-xs font-black uppercase tracking-[0.3em] leading-relaxed">
              Select a peer node to initiate a temporary secure transmission session.
            </p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}

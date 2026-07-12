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
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { MobileNav } from '@/components/MobileNav'
import { usePresence } from '@/hooks/usePresence'

export default function PersonalChatPage() {
  const [users, setUsers] = useState<any[]>([])
  const [recipient, setRecipient] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isUserOnline } = usePresence()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        fetchUsers(data.user.id)
      }
    })
  }, [])

  useEffect(() => {
    if (!user || !recipient) return
    fetchMessages()

    // Subscribe to personal messages and deletions
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

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-black text-white flex">
      {/* Sidebar - Contacts */}
      <aside className={`w-full lg:w-96 border-r border-zinc-900 flex flex-col bg-zinc-950 ${recipient ? 'hidden lg:flex' : 'flex'}`}>
        <header className="p-6 border-b border-zinc-900">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-black tracking-tighter uppercase">Messages</h1>
            <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500"><ChevronLeft size={20} /></Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-10 text-center text-zinc-600 animate-pulse font-bold text-xs uppercase tracking-widest">Loading encrypted chats...</div>
          ) : users.map(u => (
            <button
              key={u.id}
              onClick={() => setRecipient(u)}
              className={`w-full p-4 md:p-6 flex items-center gap-4 hover:bg-zinc-900 transition-colors border-b border-zinc-900/50 text-left ${recipient?.id === u.id ? 'bg-zinc-900 border-r-2 border-r-emerald-500' : ''}`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-black border border-zinc-700">
                  {u.full_name?.[0] || 'U'}
                </div>
                {isUserOnline(u.id) && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-sm truncate">{u.full_name}</span>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">2m ago</span>
                </div>
                <div className="text-xs text-zinc-500 truncate font-medium">{u.department} • {u.level}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Engine */}
      <main className={`flex-1 flex flex-col bg-black relative ${!recipient ? 'hidden lg:flex' : 'flex'}`}>
        {recipient ? (
          <>
            <header className="p-3 md:p-6 border-b border-zinc-900 flex justify-between items-center bg-black/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button onClick={() => setRecipient(null)} className="lg:hidden p-2 text-zinc-500"><ChevronLeft size={20} /></button>
                <div className="relative">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-black text-xs border border-zinc-700">
                    {recipient.full_name?.[0]}
                  </div>
                  {isUserOnline(recipient.id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-sm uppercase tracking-tight">{recipient.full_name}</h2>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isUserOnline(recipient.id) ? 'text-emerald-500' : 'text-zinc-600'}`}>
                    {isUserOnline(recipient.id) ? 'Active Now' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 md:gap-4 text-zinc-500">
                <button className="p-2 hover:text-white transition-colors"><Phone size={18} /></button>
                <button className="p-2 hover:text-white transition-colors"><Video size={18} /></button>
                <button className="p-2 hover:text-white transition-colors"><MoreVertical size={18} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="flex justify-center mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={12} className="text-emerald-500" /> End-to-end encrypted • Messages vanish in 1h
                </div>
              </div>

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`group relative max-w-[85%] md:max-w-[70%] ${m.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      m.sender_id === user?.id
                        ? 'bg-emerald-500 text-black font-medium rounded-tr-none'
                        : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none'
                    }`}>
                      {m.content}

                      {/* Delete Message Action */}
                      {m.sender_id === user?.id && (
                        <button
                          onClick={() => deleteMessage(m.id)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
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

            <div className="p-4 md:p-10 border-t border-zinc-900">
              <div className="max-w-4xl mx-auto flex gap-4">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="w-12 h-12 md:w-14 md:h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95 flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1"><Clock size={10} /> AUTO-DELETE ACTIVE</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                <span>SECURE NODE BUK-01</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center mb-8">
              <MessageCircle size={40} className="text-zinc-700" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">Secure Communications</h2>
            <p className="text-zinc-500 text-sm max-w-xs font-medium leading-relaxed">
              Select a coursemate to begin a private, temporary conversation. Messages are not stored permanently.
            </p>
          </div>
        )}
      </main>
        {!recipient && <MobileNav />}
    </div>
  )
}

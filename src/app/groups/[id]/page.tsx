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
  Info,
  Trash2,
  UserX,
  Settings,
  MoreVertical,
  X
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function GroupChatPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(full_name)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
    setLoading(false)

    // Subscribe to group messages and deletions
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
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }

  const fetchGroupData = async () => {
    const { data: groupData } = await supabase.from('groups').select('*').eq('id', groupId).single()
    setGroup(groupData)
    if (groupData) {
      fetchMessages()
      fetchMembers()
    }
  }

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('group_members')
      .select('*, profiles(full_name, department, level)')
      .eq('group_id', groupId)

    setMembers(data || [])

    const currentUserMember = data?.find(m => m.user_id === user?.id)
    setIsAdmin(currentUserMember?.role === 'admin')
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (user && groupId) fetchGroupData()
  }, [user, groupId])

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

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId)
    if (error) alert('Failed to delete message: ' + error.message)
  }

  const removeMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId)
    if (error) alert('Failed to remove member: ' + error.message)
    else fetchMembers()
  }

  const deleteGroup = async () => {
    if (!confirm('Are you sure you want to DELETE this group? This cannot be undone.')) return
    const { error } = await supabase.from('groups').delete().eq('id', groupId)
    if (error) alert('Failed to delete group: ' + error.message)
    else router.push('/groups')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-3 md:p-6 border-b border-zinc-900 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-10">
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
           <button
             onClick={() => setShowSettings(!showSettings)}
             className="p-2 text-zinc-500 hover:text-white"
           >
             <Settings size={20} />
           </button>
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
            <div className={`group relative max-w-[85%] md:max-w-[70%] ${m.sender_id === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
              {m.sender_id !== user?.id && (
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter mb-1 ml-1">
                  {m.profiles?.full_name || 'Student'}
                </span>
              )}
              <div className={`relative p-4 rounded-2xl text-sm leading-relaxed ${
                m.sender_id === user?.id
                  ? 'bg-emerald-500 text-black font-medium rounded-tr-none'
                  : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none'
              }`}>
                {m.content}

                {/* Delete Message Action */}
                {(isAdmin || m.sender_id === user?.id) && (
                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 p-6 md:p-10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Circle Info</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Members ({members.length})</h3>
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-900 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center font-black text-[10px]">
                            {m.profiles?.full_name?.[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{m.profiles?.full_name}</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase">{m.role}</p>
                          </div>
                        </div>
                        {isAdmin && m.user_id !== user?.id && (
                          <button
                            onClick={() => removeMember(m.user_id)}
                            className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <UserX size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-6 border-t border-zinc-900">
                    <button
                      onClick={deleteGroup}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={14} /> DELETE CIRCLE
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 md:p-10 border-t border-zinc-900 bg-black/80 backdrop-blur-xl">
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
            className="w-12 h-12 md:w-14 md:h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95 flex-shrink-0"
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

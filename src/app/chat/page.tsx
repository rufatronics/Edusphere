'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, User, Check, CheckCheck } from 'lucide-react'

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [user, setUser] = useState<any>(null)
  const [recipient, setRecipient] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!user || !recipient) return

    // Fetch existing messages
    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel('realtime_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new.sender_id === recipient.id) {
          setMessages(prev => [...prev, payload.new])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, recipient])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').limit(20)
    setUsers(data?.filter(u => u.id !== user?.id) || [])
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

    const newMessage = {
      sender_id: user.id,
      receiver_id: recipient.id,
      content: input,
    }

    const { data, error } = await supabase.from('messages').insert([newMessage]).select()

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setMessages(prev => [...prev, data[0]])
      setInput('')
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 max-w-6xl mx-auto border-x overflow-hidden">
      {/* Sidebar - User List */}
      <aside className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Conversations</div>
        {users.map(u => (
          <button
            key={u.id}
            onClick={() => setRecipient(u)}
            className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 border-b transition-colors ${recipient?.id === u.id ? 'bg-green-50 border-r-4 border-r-primary' : ''}`}
          >
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold relative">
              {u.full_name?.[0] || 'U'}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm truncate">{u.full_name}</div>
              <div className="text-xs text-gray-500 truncate">{u.department}</div>
            </div>
          </button>
        ))}
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        {recipient ? (
          <>
            <header className="p-4 border-b flex items-center gap-3 bg-gray-50">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs">
                {recipient.full_name?.[0]}
              </div>
              <div className="font-bold">{recipient.full_name}</div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] dark:bg-gray-900">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[75%] shadow-sm text-sm ${m.sender_id === user?.id ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                    <div>{m.content}</div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {m.sender_id === user?.id && (
                        m.is_delivered ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-full focus:ring-2 focus:ring-primary outline-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-primary text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <User size={64} />
            </div>
            <p className="font-medium">Select a student to start chatting</p>
            <p className="text-sm">Privacy first: Messages are temporary</p>
          </div>
        )}
      </main>
    </div>
  )
}

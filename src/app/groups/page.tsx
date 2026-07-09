'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Plus,
  Lock,
  Globe,
  MessageSquare,
  ChevronLeft,
  Search,
  ArrowRight,
  Zap,
  TrendingUp,
  X
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function StudyGroups() {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const supabase = createClient()





  const fetchGroups = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('groups')
      .select('*, group_members(count)')

    if (error) console.error(error)
    else setGroups(data || [])
    setLoading(false)
  }

  const joinGroup = async (groupId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: user.id }])

    if (error) alert(error.message)
    else fetchGroups()
  }

  useEffect(() => {
    fetchGroups()
  }, [])



  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          name: newGroupName,
          description: newGroupDesc,
          is_public: isPublic,
          creator_id: user.id
        }
      ])
      .select()

    if (error) {
      alert(error.message)
    } else {
      await supabase.from('group_members').insert([
        { group_id: data[0].id, user_id: user.id }
      ])
      setShowCreateModal(false)
      setNewGroupName('')
      setNewGroupDesc('')
      fetchGroups()
    }
  }



  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      {/* Header Section */}
      <div className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors">
                <ChevronLeft size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase">Peer Circles</h1>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {groups.length} Active Hubs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
               </div>
               <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 shadow-lg"
              >
                <Plus size={18} />
                <span>START CIRCLE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          {/* Left Column: Trending/Stats */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 md:p-8">
              <TrendingUp className="text-emerald-500 mb-6" size={28} />
              <h3 className="text-sm font-black uppercase mb-4 tracking-tighter">Popular Today</h3>
              <div className="space-y-4">
                {['MTH101 Finals', 'Law 2026 Prep', 'CS Hackers'].map((t, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-400">#{t.replace(' ', '')}</span>
                    <span className="text-zinc-600 font-black">200+</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-500 text-black rounded-[2rem] p-6 md:p-8">
              <Zap size={28} className="mb-4" />
              <h3 className="text-lg font-black uppercase tracking-tighter leading-tight mb-2">Boost Your Prep</h3>
              <p className="text-xs font-bold text-emerald-900 opacity-80 leading-relaxed mb-6">
                Circles with shared resources see 40% better exam results. Start sharing today!
              </p>
              <div className="text-[3rem] font-black opacity-10 leading-none select-none">GROW</div>
            </div>
          </div>

          {/* Right Column: Group Cards */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-zinc-900 animate-pulse rounded-[2rem] border border-zinc-800" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map(group => (
                  <motion.div
                    key={group.id}
                    whileHover={{ y: -5 }}
                    className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-[2rem] hover:border-emerald-500/30 transition-all flex flex-col group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-500 border border-zinc-800">
                        <Users size={28} />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black text-zinc-600 uppercase tracking-widest px-3 py-1 bg-zinc-900 rounded-full">
                        {group.is_public ? <Globe size={12} /> : <Lock size={12} />}
                        {group.is_public ? 'Public Hub' : 'Private Hub'}
                      </div>
                    </div>

                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{group.name}</h3>
                    <p className="text-zinc-500 text-xs font-medium mb-10 line-clamp-2 leading-relaxed">
                      {group.description || 'No description provided. Join to see what we are discussing.'}
                    </p>

                    <div className="mt-auto pt-6 border-t border-zinc-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[8px] font-black text-zinc-500 uppercase">
                              U{i}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-zinc-600 uppercase">
                          {group.group_members?.[0]?.count || 0} Members
                        </span>
                      </div>
                      <Link
                        href={`/groups/${group.id}`}
                        onClick={(e) => {
                          if (group.group_members?.[0]?.count === 0) {
                            e.preventDefault()
                            joinGroup(group.id).then(() => router.push(`/groups/${group.id}`))
                          }
                        }}
                        className="text-xs font-black text-white hover:text-emerald-400 flex items-center gap-2 group-hover:translate-x-1 transition-all"
                      >
                        JOIN HUB <ArrowRight size={14} />
                      </Link>
                    </div>

                    {/* Subtle Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Start a Circle</h2>
              <p className="text-zinc-500 text-sm font-medium mb-8 uppercase tracking-widest">Collaborate with fellow BUK students</p>

              <form onSubmit={createGroup} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">CIRCLE NAME</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. MTH101 Study Unit"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">DESCRIPTION</label>
                  <textarea
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 h-32"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Focus: Harmattan Semester Past Questions..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${isPublic ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${!isPublic ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                  >
                    Private
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black py-4 md:py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 mt-4"
                >
                  CREATE CIRCLE
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

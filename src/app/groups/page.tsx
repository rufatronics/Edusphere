'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Plus,
  Search,
  Globe,
  Lock,
  ArrowRight,
  ChevronLeft,
  X,
  Zap,
  TrendingUp,
  ShieldAlert
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileNav } from '@/components/MobileNav'

const BUK_FACULTIES = [
  'Agriculture', 'Arts & Islamic Studies', 'Basic Medical Sciences', 'Clinical Sciences',
  'Computing', 'Education', 'Engineering', 'Law', 'Life Sciences', 'Management Sciences',
  'Pharmaceutical Sciences', 'Physical Sciences', 'Social Sciences', 'Communication'
]

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setCheckingAuth(false)
        return
      }
      setUser(authUser)
      setCheckingAuth(false)
      fetchGroups()
    }
    checkUser()
  }, [])

  const fetchGroups = async () => {
    const { data } = await supabase
      .from('groups')
      .select('*, group_members(count)')
      .order('created_at', { ascending: false })
    setGroups(data || [])
    setLoading(false)
  }

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { data, error } = await supabase
      .from('groups')
      .insert([{
        name: newGroupName,
        description: newGroupDesc,
        is_public: isPublic,
        creator_id: user.id
      }])
      .select()
      .single()

    if (data) {
      await supabase.from('group_members').insert([
        { group_id: data.id, user_id: user.id, role: 'admin' }
      ])
      router.push(`/groups/${data.id}`)
    }
  }

  const joinGroup = async (groupId: string) => {
    if (!user) return
    await supabase.from('group_members').insert([
      { group_id: groupId, user_id: user.id, role: 'member' }
    ])
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
         className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center mb-8 text-orange-500 shadow-2xl shadow-orange-500/10"
       >
          <ShieldAlert size={40} />
       </motion.div>
       <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Network Access Only</h1>
       <p className="text-zinc-500 max-w-sm mb-10 font-medium leading-relaxed uppercase text-[10px] tracking-widest">
         Collective study hubs require an established academic profile for participation and moderation. Please identify yourself.
       </p>
       <div className="flex flex-col w-full max-w-xs gap-4">
         <Link href="/login" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">
           Account Authentication
         </Link>
         <Link href="/dashboard" className="w-full border border-zinc-800 py-4 rounded-2xl font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
           Abort Request
         </Link>
       </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-black text-white font-sans">
      <div className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2.5 hover:bg-zinc-900 rounded-xl text-zinc-500 transition-colors">
                <ChevronLeft size={22} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">Study Hubs</h1>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> Peer Intelligence Network
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    type="text"
                    placeholder="Locate group..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
               </div>
               <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-black px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-white/5"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">INITIATE HUB</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Trending/Stats */}
          <div className="lg:col-span-3 space-y-10">
            <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <TrendingUp className="text-emerald-500 mb-8 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-xs font-black uppercase mb-6 tracking-[0.2em] text-zinc-400">Hub Activity</h3>
              <div className="space-y-6">
                {['MTH101', 'LAW202', 'CSC400'].map((t, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="font-black text-sm text-zinc-200">#{t}</span>
                    <span className="text-[10px] text-zinc-600 font-black uppercase bg-zinc-900 px-2 py-1 rounded-lg">80+ NEW</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-500 text-black rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-500/10 group">
              <Zap size={32} className="mb-6 group-hover:rotate-12 transition-transform" />
              <h3 className="text-xl font-black uppercase tracking-tight leading-tight mb-4 text-emerald-950">Boost Hub Ranking</h3>
              <p className="text-[11px] font-bold text-emerald-900/80 leading-relaxed mb-10 uppercase tracking-widest">
                Active sharing increases your Hub standing. High ranking circles get priority AI compute.
              </p>
              <div className="text-6xl font-black opacity-5 select-none leading-none">RANK</div>
            </div>
          </div>

          {/* Right Column: Group Cards */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-zinc-900/20 animate-pulse rounded-[2.5rem] border border-zinc-900" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map(group => (
                  <motion.div
                    key={group.id}
                    whileHover={{ y: -5 }}
                    className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all flex flex-col group relative overflow-hidden shadow-2xl"
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center text-emerald-500 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform">
                        <Users size={32} />
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest px-4 py-1.5 bg-zinc-900 rounded-full border border-zinc-800/50">
                        {group.is_public ? <Globe size={12} className="text-emerald-500" /> : <Lock size={12} className="text-orange-500" />}
                        {group.is_public ? 'Public Access' : 'Encrypted'}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black mb-3 uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{group.name}</h3>
                    <p className="text-zinc-500 text-xs font-medium mb-12 line-clamp-2 leading-relaxed uppercase tracking-widest">
                      {group.description || 'Access terminal to view intelligence data and collaborate with node peers.'}
                    </p>

                    <div className="mt-auto pt-8 border-t border-zinc-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-9 h-9 rounded-2xl bg-zinc-800 border-4 border-zinc-950 flex items-center justify-center text-[10px] font-black text-zinc-600 uppercase shadow-lg">
                              U{i}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
                          {group.group_members?.[0]?.count || 0} PEERS
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
                        className="text-[10px] font-black text-white hover:text-emerald-400 flex items-center gap-3 group-hover:translate-x-1 transition-all uppercase tracking-[0.2em]"
                      >
                        SYNC HUB <ArrowRight size={16} />
                      </Link>
                    </div>

                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-8 right-8 p-2 text-zinc-600 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>

              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Start Hub</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Collective Intelligence Node</p>

              <form onSubmit={createGroup} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">HUB IDENTITY</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="MTH101 STUDY SQUAD"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">MISSION PARAMETERS</label>
                  <textarea
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-32 resize-none"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Focusing on past questions for Harmattan Semester..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${isPublic ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${!isPublic ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
                  >
                    Private
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all active:scale-95 mt-6 shadow-xl"
                >
                  INITIALIZE NODE
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

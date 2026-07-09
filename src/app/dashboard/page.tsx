'use client'

import { MobileNav } from '@/components/MobileNav'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Bot,
  MessageCircle,
  Users,
  LogOut,
  Flame,
  Search,
  Bell,
  User,
  LayoutDashboard,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { usePresence } from '@/hooks/usePresence'
import { trackActivity } from '@/utils/activity'
import { Footer } from '@/components/Footer'

export default function Dashboard() {
  const { onlineUsers } = usePresence()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackActivity()
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      // Fetch recent activity
      const { data: resources } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setActivity(resources || [])
      setLoading(false)
    }
    getProfile()
  }, [])

  if (loading) return (
    <div className="min-h-screen pb-20 md:pb-0 bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const quickActions = [
    { name: 'Resource Hub', icon: <BookOpen />, href: '/resources', color: 'bg-blue-500/20 text-blue-400', desc: 'Past questions & notes' },
    { name: 'AI Tutor', icon: <Bot />, href: '/ai-tutor', color: 'bg-emerald-500/20 text-emerald-400', desc: '24/7 academic help' },
    { name: 'Chat', icon: <MessageCircle />, href: '/chat', color: 'bg-purple-500/20 text-purple-400', desc: 'Direct messages' },
    { name: 'Study Groups', icon: <Users />, href: '/groups', color: 'bg-orange-500/20 text-orange-400', desc: 'Collaborate' },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-black text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 flex flex-col p-6 hidden lg:flex">
        <div className="text-xl font-black tracking-tighter flex items-center gap-2 mb-12">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center">
            <span className="text-black text-base font-black">E</span>
          </div>
          EDUSPHERE
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/resources" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 transition-colors">
            <BookOpen size={20} /> Resources
          </Link>
          <Link href="/ai-tutor" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 transition-colors">
            <Bot size={20} /> AI Tutor
          </Link>
          <Link href="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 transition-colors">
            <MessageCircle size={20} /> Chat
          </Link>
          <Link href="/groups" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 transition-colors">
            <Users size={20} /> Groups
          </Link>
        </nav>

        <div className="mt-auto space-y-2 pt-8 border-t border-zinc-900">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 transition-colors">
            <Settings size={20} /> Settings
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">STUDENT DASHBOARD</h1>
            <p className="text-zinc-500 font-medium">Good day, {profile?.full_name?.split(' ')[0] || 'Scholar'} — Let&apos;s hit the books.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
             </div>
             <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-black"></span>
             </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center">
              <Flame size={28} />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Study Streak</p>
              <h3 className="text-2xl font-black">{profile?.study_streak || 0} DAYS</h3>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Resources</p>
              <h3 className="text-2xl font-black">2.4k AVAIL.</h3>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Active Today</p>
              <h3 className="text-2xl font-black">{Object.keys(onlineUsers).length} ONLINE</h3>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Quick Access */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={action.href} className="group block bg-zinc-900/50 border border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] h-full hover:border-emerald-500/50 transition-colors">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-6`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-black mb-2 flex items-center justify-between">
                    {action.name}
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-zinc-500 text-sm font-medium">{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 md:p-8">
            <h2 className="text-xl font-black mb-6">ACTIVITY</h2>
            <div className="space-y-6">
              {activity.length === 0 ? (
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center py-10">No recent activity</p>
              ) : activity.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center text-xs">
                    📚
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate uppercase tracking-tight">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">
                      Uploaded to {item.department}
                    </p>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 bg-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                VIEW ALL HISTORY
              </button>
            </div>
          </div>

          {/* Suggestion / AI Card */}
          <div className="md:col-span-12 bg-emerald-500 text-black rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-4">READY FOR YOUR EXAMS?</h2>
              <p className="text-emerald-900 font-bold max-w-md mb-8">Let EduSphere AI generate a practice quiz based on your department&apos;s latest resources.</p>
              <Link href="/ai-tutor" className="px-6 py-3 md:px-8 md:py-4 bg-black text-white rounded-2xl font-black hover:bg-zinc-800 transition-all active:scale-95 inline-block">
                GENERATE MOCK QUIZ
              </Link>
            </div>
            <div className="text-[12rem] font-black opacity-10 absolute right-[-2rem] bottom-[-4rem] pointer-events-none tracking-tighter">
              BUK
            </div>
          </div>
        </div>
        <Footer />
      </main>
        <MobileNav />
    </div>
  )
}

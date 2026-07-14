'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  Flame,
  Bell,
  Search,
  ChevronRight,
  Plus,
  Target,
  Calendar,
  Clock,
  Zap,
  TrendingUp,
  Brain,
  ShieldAlert,
  User
} from 'lucide-react'
import { MobileNav } from '@/components/MobileNav'
import { Footer } from '@/components/Footer'
import { usePresence } from '@/hooks/usePresence'
import { trackActivity } from '@/utils/activity'
import { getDB, PlannerItem, StudyGoal, StudyStats, Course } from '@/lib/db'
import { InstallPrompt } from '@/components/InstallPrompt'

const GRADING_SYSTEM = [
  { grade: 'A', points: 5 },
  { grade: 'B', points: 4 },
  { grade: 'C', points: 3 },
  { grade: 'D', points: 2 },
  { grade: 'E', points: 1 },
  { grade: 'F', points: 0 },
]

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([])
  const [goals, setGoals] = useState<StudyGoal[]>([])
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const router = useRouter()
  const supabase = createClient()
  const { onlineUsers } = usePresence()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      if (authUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setProfile(profileData)
        trackActivity()
      }

      // Local Data from IndexedDB - Always available even for guests
      const db = await getDB()
      if (db) {
        const today = new Date().toISOString().split('T')[0]
        const [items, allGoals, todayStats, allCourses] = await Promise.all([
          db.getAll('planner'),
          db.getAll('goals'),
          db.get('stats', today),
          db.getAll('courses')
        ])

        setPlannerItems(items.filter(i => !i.completed).sort((a,b) => a.time.localeCompare(b.time)).slice(0, 3))
        setGoals(allGoals.filter(g => g.progress < g.target).slice(0, 2))
        setStats(todayStats || null)
        setCourses(allCourses)
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [supabase])

  const currentGPA = useMemo(() => {
    if (courses.length === 0) return null
    let totalUnits = 0
    let totalPoints = 0
    courses.forEach(c => {
      const unit = Number(c.units) || 0
      const points = GRADING_SYSTEM.find(g => g.grade === c.grade)?.points || 0
      totalUnits += unit
      totalPoints += (unit * points)
    })
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : null
  }, [courses])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const quickActions = [
    { name: 'GPA Engine', icon: <TrendingUp />, href: '/gpa', color: 'bg-emerald-500/20 text-emerald-400', desc: '5.0 Scale Calculator', offline: true },
    { name: 'Academic Planner', icon: <Calendar />, href: '/planner', color: 'bg-blue-500/20 text-blue-400', desc: 'Tasks & Deadlines', offline: true },
    { name: 'Revision Tracker', icon: <BookOpen />, href: '/revision', color: 'bg-orange-500/20 text-orange-400', desc: 'Topic Progress', offline: true },
    { name: 'Focus Timer', icon: <Brain />, href: '/pomodoro', color: 'bg-purple-500/20 text-purple-400', desc: 'Study with Pomodoro', offline: true },
  ]

  const onlineFeatures = [
    { name: 'AI Tutor', icon: <Bot />, href: '/ai-tutor', color: 'bg-emerald-500/20 text-emerald-400' },
    { name: 'Chat', icon: <MessageCircle />, href: '/chat', color: 'bg-purple-500/20 text-purple-400' },
    { name: 'Groups', icon: <Users />, href: '/groups', color: 'bg-orange-500/20 text-orange-400' },
  ]

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-black text-white font-sans flex overflow-x-hidden">
      <InstallPrompt />

      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-900 flex flex-col p-8 hidden lg:flex bg-zinc-950/50 backdrop-blur-xl">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-3 mb-16">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-black text-xl font-black">E</span>
          </div>
          EDUSPHERE
        </div>

        <nav className="flex-1 space-y-3">
          <Link href="/dashboard" className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/10 transition-all active:scale-95">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/resources" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 font-bold uppercase text-[10px] tracking-widest transition-all">
            <BookOpen size={20} /> Archive
          </Link>
          <Link href="/planner" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 font-bold uppercase text-[10px] tracking-widest transition-all">
            <Calendar size={20} /> Planner
          </Link>
          <Link href="/gpa" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 font-bold uppercase text-[10px] tracking-widest transition-all">
            <TrendingUp size={20} /> GPA Engine
          </Link>
          <div className="pt-6 pb-2 px-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Online Only</div>
          <Link href="/ai-tutor" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 font-bold uppercase text-[10px] tracking-widest transition-all">
            <Bot size={20} /> AI Tutor
          </Link>
          <Link href="/chat" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 font-bold uppercase text-[10px] tracking-widest transition-all">
            <MessageCircle size={20} /> Community
          </Link>
        </nav>

        <div className="mt-auto space-y-3 pt-10 border-t border-zinc-900">
          {user ? (
            <>
              <Link href="/settings" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 font-bold uppercase text-[10px] tracking-widest transition-all">
                <Settings size={20} /> Settings
              </Link>
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500/60 hover:bg-red-500/10 hover:text-red-500 font-black uppercase text-[10px] tracking-widest transition-all"
              >
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest transition-all hover:bg-emerald-400 active:scale-95">
               <User size={20} /> Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-14">

        {/* Guest Banner */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">Offline Guest Mode</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sign in to sync your data and access AI Tutor</p>
               </div>
            </div>
            <Link href="/login" className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl">
               Create Account
            </Link>
          </motion.div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.8] mb-4">
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, <br/>
              <span className="text-emerald-500">{profile?.full_name?.split(' ')[0] || 'Scholar'}</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Academy Dashboard v2.0
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  type="text"
                  placeholder="Search your library..."
                  className="bg-zinc-900/30 border border-zinc-800 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium transition-all"
                />
             </div>
             <button className="w-14 h-14 bg-zinc-900/30 border border-zinc-800 rounded-[1.5rem] flex items-center justify-center text-zinc-400 hover:text-white relative transition-all active:scale-95">
                <Bell size={24} />
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full border-[3px] border-black"></span>
             </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16">
          <motion.div whileHover={{ y: -5 }} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <Flame className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Study Streak</p>
            <h3 className="text-3xl font-black tracking-tighter">{profile?.study_streak || 0} DAYS</h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <Target className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Current GPA</p>
            <h3 className="text-3xl font-black tracking-tighter">{currentGPA || '0.00'}</h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <Clock className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Study Time</p>
            <h3 className="text-3xl font-black tracking-tighter">{stats?.hoursStudied?.toFixed(1) || '0.0'} HRS</h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <Users className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={28} />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Online Now</p>
            <h3 className="text-3xl font-black tracking-tighter">{Object.keys(onlineUsers).length}</h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
          </motion.div>
        </div>

        {/* Action & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">

          {/* Toolkit */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <motion.div key={i} whileHover={{ y: -5 }}>
                <Link href={action.href} className="group block bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem] h-full hover:border-emerald-500/30 transition-all relative overflow-hidden shadow-2xl">
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-10 shadow-inner`}>
                    {action.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-3 flex items-center justify-between uppercase tracking-tighter">
                    {action.name}
                    <ChevronRight size={22} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[80%]">{action.desc}</p>

                  {action.offline && (
                    <div className="absolute top-8 right-8 bg-zinc-900/50 px-3 py-1 rounded-full text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-800">
                      Offline Ready
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Activity/Planner Panels */}
          <div className="md:col-span-4 space-y-8">
            {/* Planner Preview */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-base font-black uppercase tracking-widest flex items-center gap-3">
                    <Calendar size={20} className="text-blue-500" /> Next Up
                 </h2>
                 <Link href="/planner" className="p-2 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-colors">
                    <Plus size={18} />
                 </Link>
              </div>

              <div className="space-y-4">
                {plannerItems.length === 0 ? (
                  <div className="py-12 text-center">
                     <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Schedule is clear</p>
                  </div>
                ) : plannerItems.map((item, i) => (
                  <div key={i} className="flex gap-5 p-5 bg-zinc-900/30 border border-zinc-900 rounded-[1.8rem] group hover:border-blue-500/30 transition-all">
                    <div className={`w-1.5 rounded-full ${item.priority === 'High' ? 'bg-red-500' : item.priority === 'Medium' ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black uppercase tracking-tight truncate mb-1">{item.title}</p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase">{item.time} • {item.category}</p>
                    </div>
                  </div>
                ))}
                {plannerItems.length > 0 && (
                  <Link href="/planner" className="block w-full py-4 bg-zinc-900 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-zinc-800 hover:text-white transition-all mt-6">
                    View Complete Planner
                  </Link>
                )}
              </div>
            </div>

            {/* Goals Preview */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl">
              <h2 className="text-base font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                <Target size={20} className="text-emerald-500" /> Priorities
              </h2>
              <div className="space-y-8">
                {goals.length === 0 ? (
                  <div className="py-12 text-center">
                     <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">No goals set</p>
                  </div>
                ) : goals.map((goal, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-zinc-400 truncate max-w-[70%]">{goal.title}</span>
                      <span className="text-emerald-500 font-black">{Math.round((goal.progress / goal.target) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(goal.progress / goal.target) * 100}%` }}
                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Banner - Modernized */}
          <div className="md:col-span-12 bg-emerald-500 text-black rounded-[3.5rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-2xl shadow-emerald-500/20 group">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-black/5">
                <Zap size={14} /> Intelligence Engine
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-10">Break Through Your <br/> Academic Limits</h2>
              <p className="text-emerald-950 font-bold text-lg md:text-xl leading-relaxed mb-12 opacity-90">Our AI tutor uses BUK syllabus data to simplify your hardest courses. Available 24/7 for authenticated students.</p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/ai-tutor" className="px-12 py-5 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-zinc-900 transition-all active:scale-95 shadow-2xl text-center">
                  Start AI Session
                </Link>
                {/* Secondary Button logic for guests */}
                {!user && (
                   <Link href="/login" className="px-12 py-5 border-2 border-emerald-600/30 text-emerald-950 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-emerald-600/10 transition-all text-center">
                      Join Platform
                   </Link>
                )}
              </div>
            </div>
            <Zap size={600} className="absolute right-[-100px] bottom-[-150px] opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-1000" />

            {/* Visual Flair */}
            <div className="absolute top-12 right-20 w-40 h-40 border-8 border-emerald-400/20 rounded-full opacity-20" />
            <div className="absolute bottom-40 right-40 w-20 h-20 border-4 border-emerald-400/20 rounded-full opacity-20" />
          </div>

        </div>

        <Footer />
      </main>
      <MobileNav />
    </div>
  )
}

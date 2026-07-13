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
  Brain
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Local Data from IndexedDB
      const db = await getDB()
      if (db) {
        const today = new Date().toISOString().split('T')[0]
        const [items, allGoals, todayStats, allCourses] = await Promise.all([
          db.getAll('planner'),
          db.getAll('goals'),
          db.get('stats', today),
          db.getAll('courses')
        ])

        setPlannerItems(items.filter(i => !i.completed).slice(0, 3))
        setGoals(allGoals.filter(g => g.progress < g.target).slice(0, 2))
        setStats(todayStats || null)
        setCourses(allCourses)
      }

      setLoading(false)
      trackActivity()
    }

    fetchDashboardData()
  }, [router, supabase])

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
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const quickActions = [
    { name: 'GPA Engine', icon: <TrendingUp />, href: '/gpa', color: 'bg-emerald-500/20 text-emerald-400', desc: '5.0 Scale Calculator' },
    { name: 'Academic Planner', icon: <Calendar />, href: '/planner', color: 'bg-blue-500/20 text-blue-400', desc: 'Tasks & Deadlines' },
    { name: 'Revision Tracker', icon: <BookOpen />, href: '/revision', color: 'bg-orange-500/20 text-orange-400', desc: 'Topic Progress' },
    { name: 'Focus Timer', icon: <Brain />, href: '/pomodoro', color: 'bg-purple-500/20 text-purple-400', desc: 'Study with Pomodoro' },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-black text-white font-sans flex">
      <InstallPrompt />
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
          <Link href="/resources" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900">
            <BookOpen size={20} /> Resources
          </Link>
          <Link href="/planner" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900">
            <Calendar size={20} /> Planner
          </Link>
          <Link href="/gpa" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900">
            <TrendingUp size={20} /> GPA Engine
          </Link>
          <Link href="/ai-tutor" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900">
            <Bot size={20} /> AI Tutor
          </Link>
          <Link href="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900">
            <MessageCircle size={20} /> Chat
          </Link>
        </nav>

        <div className="mt-auto space-y-2 pt-8 border-t border-zinc-900">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900">
            <Settings size={20} /> Settings
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">Good Day, {profile?.full_name?.split(' ')[0] || 'Scholar'}</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Your Personal Academy Hub
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Find materials..."
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
             </div>
             <button className="w-12 h-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-black"></span>
             </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem]">
            <Flame className="text-orange-500 mb-4" size={24} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Streak</p>
            <h3 className="text-2xl font-black">{profile?.study_streak || 0} Days</h3>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem]">
            <Target className="text-emerald-500 mb-4" size={24} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">GPA</p>
            <h3 className="text-2xl font-black">{currentGPA || 'N/A'}</h3>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem]">
            <Clock className="text-blue-500 mb-4" size={24} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Study</p>
            <h3 className="text-2xl font-black">{stats?.hoursStudied?.toFixed(1) || '0.0'} Hrs</h3>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem]">
            <Users className="text-purple-500 mb-4" size={24} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Online</p>
            <h3 className="text-2xl font-black">{Object.keys(onlineUsers).length} Students</h3>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Quick Actions */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <motion.div key={i} whileHover={{ y: -5 }}>
                <Link href={action.href} className="group block bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] h-full hover:border-emerald-500/30 transition-all">
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mb-8`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-black mb-2 flex items-center justify-between uppercase tracking-tight">
                    {action.name}
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-zinc-500 text-xs font-medium leading-relaxed">{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Side Panels */}
          <div className="md:col-span-4 space-y-6">
            {/* Today's Planner */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8">
              <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calendar size={16} /> Today&apos;s Focus
              </h2>
              <div className="space-y-4">
                {plannerItems.length === 0 ? (
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest py-10 text-center">All caught up!</p>
                ) : plannerItems.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-black/40 border border-zinc-900 rounded-2xl">
                    <div className="w-1.5 h-full bg-blue-500 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase tracking-tight truncate">{item.title}</p>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">{item.time} • {item.category}</p>
                    </div>
                  </div>
                ))}
                <Link href="/planner" className="block w-full py-3 bg-zinc-800 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-zinc-700 transition-colors">
                  Open Planner
                </Link>
              </div>
            </div>

            {/* Goals Tracker */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8">
              <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target size={16} /> Active Goals
              </h2>
              <div className="space-y-6">
                {goals.length === 0 ? (
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest py-10 text-center text-center">No active goals</p>
                ) : goals.map((goal, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                      <span>{goal.title}</span>
                      <span className="text-emerald-500">{Math.round((goal.progress / goal.target) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(goal.progress / goal.target) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <Link href="/goals" className="block w-full py-3 bg-zinc-800 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-zinc-700 transition-colors">
                  Manage Goals
                </Link>
              </div>
            </div>
          </div>

          {/* AI Banner */}
          <div className="md:col-span-12 bg-emerald-500 text-black rounded-[3rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 uppercase leading-none">Elevate Your Academic Game</h2>
              <p className="text-emerald-950 font-bold max-w-xl text-lg leading-relaxed mb-10 opacity-80">EduSphere AI is ready to help you simplify complex topics, practice with mock exams, and refine your study strategy.</p>
              <Link href="/ai-tutor" className="px-10 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-900 transition-all active:scale-95 inline-block shadow-2xl">
                Start AI Session
              </Link>
            </div>
            <Zap size={400} className="absolute right-[-100px] bottom-[-100px] opacity-10 pointer-events-none" />
          </div>
        </div>
        <Footer />
      </main>
      <MobileNav />
    </div>
  )
}

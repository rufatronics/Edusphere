'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Trash2, ChevronLeft, BookOpen, X } from 'lucide-react'
import Link from 'next/link'
import { getDB, StudySession } from '@/lib/db'
import { useCourses } from '@/hooks/useCourses'
import { MobileNav } from '@/components/MobileNav'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function StudyPlanner() {
  const { courses } = useCourses()
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSession, setNewSession] = useState<Partial<StudySession>>({
    day: 'Monday',
    startTime: '19:00',
    endTime: '21:00',
    courseId: '',
    recurring: true
  })

  const fetchSessions = useCallback(async () => {
    const db = await getDB()
    if (!db) return
    const data = await db.getAll('studySchedule')
    setSessions(data)
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const addSession = async (e: React.FormEvent) => {
    e.preventDefault()
    const db = await getDB()
    if (!db) return
    const id = Math.random().toString(36).substring(7)
    await db.put('studySchedule', { ...newSession, id } as StudySession)
    setShowAddModal(false)
    fetchSessions()
  }

  const deleteSession = async (id: string) => {
    const db = await getDB()
    if (!db) return
    await db.delete('studySchedule', id)
    fetchSessions()
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-10 font-sans">
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500">
                <ChevronLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase">STUDY PLANNER</h1>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> Recurring Schedules
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-orange-400 transition-all active:scale-95"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-12">
          {DAYS.map(day => {
            const daySessions = sessions.filter(s => s.day === day)
            return (
              <div key={day} className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-3">
                  {day} <span className="h-[1px] flex-1 bg-zinc-900" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {daySessions.map(session => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[1.5rem] flex items-center justify-between group hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                          <Clock size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{session.startTime} - {session.endTime}</p>
                          <h4 className="text-lg font-black uppercase tracking-tight">
                            {courses.find(c => c.id === session.courseId)?.code || 'General Study'}
                          </h4>
                        </div>
                      </div>
                      <button onClick={() => deleteSession(session.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                  {daySessions.length === 0 && (
                    <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest py-4">No sessions scheduled</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <MobileNav />

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Schedule Session</h2>
              <form onSubmit={addSession} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Day of Week</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={newSession.day}
                    onChange={e => setNewSession({...newSession, day: e.target.value as any})}
                  >
                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Start Time</label>
                    <input type="time" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm" value={newSession.startTime} onChange={e => setNewSession({...newSession, startTime: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">End Time</label>
                    <input type="time" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm" value={newSession.endTime} onChange={e => setNewSession({...newSession, endTime: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Course</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={newSession.courseId}
                    onChange={e => setNewSession({...newSession, courseId: e.target.value})}
                  >
                    <option value="">Personal Study</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-400 transition-all">
                  SAVE SCHEDULE
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

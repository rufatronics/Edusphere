'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Circle, ChevronLeft, Plus, Trash2, Layout } from 'lucide-react'
import Link from 'next/link'
import { getDB, RevisionTopic } from '@/lib/db'
import { useCourses } from '@/hooks/useCourses'
import { MobileNav } from '@/components/MobileNav'

export default function RevisionTracker() {
  const { courses } = useCourses()
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [topics, setTopics] = useState<RevisionTopic[]>([])
  const [newTopic, setNewTopic] = useState('')

  const fetchTopics = useCallback(async () => {
    if (!selectedCourseId) return
    const db = await getDB()
    if (!db) return
    const allTopics = await db.getAllFromIndex('revision', 'by-course', selectedCourseId)
    setTopics(allTopics)
  }, [selectedCourseId])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const addTopic = async () => {
    if (!newTopic.trim() || !selectedCourseId) return
    const db = await getDB()
    if (!db) return
    const id = Math.random().toString(36).substring(7)
    await db.put('revision', { id, courseId: selectedCourseId, title: newTopic, completed: false })
    setNewTopic('')
    fetchTopics()
  }

  const toggleTopic = async (topic: RevisionTopic) => {
    const db = await getDB()
    if (!db) return
    await db.put('revision', { ...topic, completed: !topic.completed })
    fetchTopics()
  }

  const deleteTopic = async (id: string) => {
    const db = await getDB()
    if (!db) return
    await db.delete('revision', id)
    fetchTopics()
  }

  const progress = topics.length > 0 ? Math.round((topics.filter(t => t.completed).length / topics.length) * 100) : 0

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-10 font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-80 border-r border-zinc-900 bg-zinc-950/50 p-6 overflow-y-auto max-h-[40vh] md:max-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-black uppercase tracking-tighter">REVISION</h1>
        </div>

        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 px-2">Select Course</p>
        <div className="space-y-2">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedCourseId === course.id ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:border-zinc-700'}`}
            >
              <h4 className="font-black text-xs uppercase">{course.code}</h4>
              <p className={`text-[10px] font-bold truncate ${selectedCourseId === course.id ? 'text-black/70' : 'text-zinc-600'}`}>{course.title}</p>
            </button>
          ))}
          {courses.length === 0 && (
            <p className="text-[10px] text-zinc-600 text-center py-10 italic">Add courses in GPA Engine first</p>
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {selectedCourseId ? (
          <div className="max-w-3xl mx-auto space-y-10">
            <header>
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">
                {courses.find(c => c.id === selectedCourseId)?.code} Tracker
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <span className="text-xl font-black text-emerald-500">{progress}%</span>
              </div>
            </header>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="New topic or chapter..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-6 pr-16 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTopic()}
                />
                <button
                  onClick={addTopic}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-black rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-90"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {topics.map(topic => (
                  <motion.div
                    key={topic.id}
                    layout
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${topic.completed ? 'bg-zinc-900/20 border-zinc-900 opacity-50' : 'bg-zinc-900/50 border-zinc-800'}`}
                  >
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleTopic(topic)}>
                        {topic.completed ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-zinc-600" />}
                      </button>
                      <span className={`text-sm font-bold uppercase tracking-tight ${topic.completed ? 'line-through' : ''}`}>{topic.title}</span>
                    </div>
                    <button onClick={() => deleteTopic(topic.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
            <Layout size={80} className="mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Topic Progress</h2>
            <p className="text-xs font-bold uppercase tracking-widest mt-2">Select a course to start tracking your revision</p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}

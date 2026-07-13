'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  X,
  BookOpen,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { getDB, PlannerItem } from '@/lib/db'
import { useCourses } from '@/hooks/useCourses'
import { MobileNav } from '@/components/MobileNav'
import { useNotification } from '@/hooks/useNotification'

const CATEGORIES = [
  'Assignment', 'Test', 'Quiz', 'Exam', 'Project', 'Reading', 'Study', 'Reminder'
]

const PRIORITIES = ['Low', 'Medium', 'High']

export default function AcademicPlanner() {
  const { courses } = useCourses()
  const { sendNotification } = useNotification()
  const [items, setItems] = useState<PlannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('All')
  const [newItem, setNewItem] = useState<Partial<PlannerItem>>({
    title: '',
    category: 'Study',
    priority: 'Medium',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    courseId: '',
    notes: '',
    reminder: true,
    completed: false
  })

  const fetchItems = useCallback(async () => {
    const db = await getDB()
    if (!db) return
    const data = await db.getAll('planner')
    setItems(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const db = await getDB()
    if (!db) return

    const id = Math.random().toString(36).substring(7)
    const item = { ...newItem, id } as PlannerItem
    await db.put('planner', item)

    if (item.reminder) {
      // Logic for future notification would go here
      sendNotification('Planner Item Added', { body: `Reminder set for ${item.title} on ${item.date}` })
    }

    setShowAddModal(false)
    setNewItem({
      title: '',
      category: 'Study',
      priority: 'Medium',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      courseId: '',
      notes: '',
      reminder: true,
      completed: false
    })
    fetchItems()
  }

  const toggleComplete = async (item: PlannerItem) => {
    const db = await getDB()
    if (!db) return
    await db.put('planner', { ...item, completed: !item.completed })
    fetchItems()
  }

  const deleteItem = async (id: string) => {
    const db = await getDB()
    if (!db) return
    await db.delete('planner', id)
    fetchItems()
  }

  const filteredItems = items.filter(i => filter === 'All' || i.category === filter)

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-10 font-sans">
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors">
                <ChevronLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Academic Planner</h1>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Tasks & Deadlines
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-400 transition-all active:scale-95 shadow-lg"
            >
              <Plus size={18} /> <span>ADD EVENT</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Filters */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          <button
            onClick={() => setFilter('All')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === 'All' ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
          >
            All Items
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === cat ? 'bg-blue-500 text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Planner List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center animate-pulse">
               <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Accessing local cache...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem]">
               <Calendar size={48} className="mx-auto text-zinc-800 mb-4" />
               <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Your schedule is clear</p>
            </div>
          ) : filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group bg-zinc-900/30 border border-zinc-900 p-5 rounded-[1.5rem] flex items-center justify-between transition-all hover:border-zinc-700 ${item.completed ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(item)}
                  className="mt-1 text-zinc-600 hover:text-blue-500 transition-colors"
                >
                  {item.completed ? <CheckCircle2 className="text-blue-500" /> : <Circle />}
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-black text-sm uppercase tracking-tight ${item.completed ? 'line-through' : ''}`}>{item.title}</h4>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${
                      item.priority === 'High' ? 'bg-red-500 text-white' :
                      item.priority === 'Medium' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                      <Clock size={10} /> {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {item.time}
                    </p>
                    <p className="text-[10px] text-blue-500 font-bold uppercase flex items-center gap-1">
                      <BookOpen size={10} /> {courses.find(c => c.id === item.courseId)?.code || 'Personal'}
                    </p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase">
                      {item.category}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">New Planner Event</h2>

              <form onSubmit={handleAddItem} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Event Title</label>
                  <input
                    required
                    placeholder="e.g. MTH101 Assignment"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={newItem.title}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Category</label>
                    <select
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Priority</label>
                    <select
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={newItem.priority}
                      onChange={e => setNewItem({...newItem, priority: e.target.value as any})}
                    >
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Date</label>
                    <input
                      type="date"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={newItem.date}
                      onChange={e => setNewItem({...newItem, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Time</label>
                    <input
                      type="time"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={newItem.time}
                      onChange={e => setNewItem({...newItem, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Related Course</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={newItem.courseId}
                    onChange={e => setNewItem({...newItem, courseId: e.target.value})}
                  >
                    <option value="">Personal / General</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Notes</label>
                  <textarea
                    placeholder="Additional details..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none h-24"
                    value={newItem.notes}
                    onChange={e => setNewItem({...newItem, notes: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-400 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  SAVE EVENT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

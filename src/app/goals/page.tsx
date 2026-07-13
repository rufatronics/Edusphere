'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Target, ChevronLeft, CheckCircle2, Clock, X, Award, Zap } from 'lucide-react'
import Link from 'next/link'
import { getDB, StudyGoal } from '@/lib/db'
import { MobileNav } from '@/components/MobileNav'

export default function StudyGoals() {
  const [goals, setGoals] = useState<StudyGoal[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGoal, setNewGoal] = useState<Partial<StudyGoal>>({
    title: '',
    type: 'task',
    target: 1,
    progress: 0,
    date: new Date().toISOString().split('T')[0]
  })

  const fetchGoals = useCallback(async () => {
    const db = await getDB()
    if (!db) return
    const data = await db.getAll('goals')
    setGoals(data)
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    const db = await getDB()
    if (!db) return
    const id = Math.random().toString(36).substring(7)
    await db.put('goals', { ...newGoal, id } as StudyGoal)
    setShowAddModal(false)
    fetchGoals()
  }

  const updateProgress = async (goal: StudyGoal, amount: number) => {
    const db = await getDB()
    if (!db) return
    const newProgress = Math.max(0, Math.min(goal.target, goal.progress + amount))
    await db.put('goals', { ...goal, progress: newProgress })
    fetchGoals()
  }

  const deleteGoal = async (id: string) => {
    const db = await getDB()
    if (!db) return
    await db.delete('goals', id)
    fetchGoals()
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-10 font-sans">
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Academic Goals</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <Target size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem]">
               <Award size={48} className="mx-auto text-zinc-800 mb-4" />
               <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Set your first academic target</p>
            </div>
          ) : goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:border-emerald-500/30 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${goal.progress >= goal.target ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-emerald-500'}`}>
                    {goal.type === 'time' ? <Clock size={24} /> : <Zap size={24} />}
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{goal.title}</h3>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">
                  {goal.progress} / {goal.target} {goal.type === 'time' ? 'Minutes' : 'Tasks'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.progress / goal.target) * 100}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProgress(goal, goal.type === 'time' ? 15 : 1)}
                    className="flex-1 py-3 bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all"
                  >
                    + {goal.type === 'time' ? '15m' : '1'}
                  </button>
                  {goal.progress >= goal.target && (
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                       <CheckCircle2 size={24} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <MobileNav />

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 p-10 rounded-[2.5rem]">
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-zinc-500"><X size={24} /></button>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Set Goal</h2>
              <form onSubmit={addGoal} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">What is your goal?</label>
                  <input required placeholder="e.g. Study Physics" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setNewGoal({...newGoal, type: 'time'})} className={`py-3 rounded-xl text-[10px] font-black uppercase ${newGoal.type === 'time' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>Time Based</button>
                  <button type="button" onClick={() => setNewGoal({...newGoal, type: 'task'})} className={`py-3 rounded-xl text-[10px] font-black uppercase ${newGoal.type === 'task' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>Task Based</button>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Target ({newGoal.type === 'time' ? 'Minutes' : 'Tasks'})</label>
                  <input type="number" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: parseInt(e.target.value)})} />
                </div>
                <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">START TRACKING</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

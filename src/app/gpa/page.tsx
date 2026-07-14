'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Calculator, ChevronLeft, TrendingUp, X } from 'lucide-react'
import Link from 'next/link'
import { useCourses } from '@/hooks/useCourses'
import { MobileNav } from '@/components/MobileNav'

const GRADING_SYSTEM = [
  { grade: 'A', points: 5 },
  { grade: 'B', points: 4 },
  { grade: 'C', points: 3 },
  { grade: 'D', points: 2 },
  { grade: 'E', points: 1 },
  { grade: 'F', points: 0 },
]

export default function GPACalculator() {
  const { courses, saveCourse, removeCourse } = useCourses()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCourse, setNewCourse] = useState({ code: '', title: '', units: 3, grade: 'A' })

  const stats = useMemo(() => {
    let totalUnits = 0
    let totalPoints = 0

    courses.forEach(c => {
      const unit = Number(c.units) || 0
      const gradeInfo = GRADING_SYSTEM.find(g => g.grade === c.grade)
      const points = gradeInfo ? gradeInfo.points : 0

      totalUnits += unit
      totalPoints += (unit * points)
    })

    const gpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00'
    return { totalUnits, totalPoints, gpa }
  }, [courses])

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = Math.random().toString(36).substring(7)
    await saveCourse({
      id,
      ...newCourse
    })

    setNewCourse({ code: '', title: '', units: 3, grade: 'A' })
    setShowAddModal(false)
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-10 font-sans selection:bg-emerald-500/30">
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-5 md:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2.5 hover:bg-zinc-900 rounded-xl text-zinc-500 transition-colors">
                <ChevronLeft size={22} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">GPA Engine</h1>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-1">5.0 Scale</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              <Plus size={18} /> <span className="hidden sm:inline">ADD COURSE</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* GPA Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500 text-black rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl shadow-emerald-500/10"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Current Semester GPA</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-8xl md:text-9xl font-black tracking-tighter">{stats.gpa}</h2>
              <span className="text-2xl font-black opacity-30">/ 5.0</span>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-black/10 pt-10">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Total Units</p>
                <p className="text-3xl font-black">{stats.totalUnits}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Total Points</p>
                <p className="text-3xl font-black">{stats.totalPoints}</p>
              </div>
            </div>
          </div>
          <Calculator size={300} className="absolute right-[-60px] bottom-[-60px] opacity-10 rotate-12 pointer-events-none" />
        </motion.div>

        {/* Course List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <TrendingUp size={16} /> Course Breakdown
            </h3>
            <span className="text-[10px] font-black text-zinc-600 uppercase bg-zinc-900 px-3 py-1 rounded-full">{courses.length} REGISTERED</span>
          </div>

          <div className="grid gap-3">
            {courses.length === 0 ? (
              <div className="py-24 text-center bg-zinc-900/10 border border-dashed border-zinc-800/50 rounded-[3rem]">
                 <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-[0.3em]">No courses found</p>
              </div>
            ) : courses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-900/40 border border-zinc-900 p-5 md:p-6 rounded-[1.8rem] flex items-center justify-between group hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-emerald-500 border border-zinc-700 text-xl shadow-inner">
                    {course.grade}
                  </div>
                  <div>
                    <h4 className="font-black text-base md:text-lg uppercase tracking-tight leading-none mb-1.5">{course.code}</h4>
                    <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest">{course.title || 'General Course'} • {course.units} Units</p>
                  </div>
                </div>
                <button
                  onClick={() => removeCourse(course.id)}
                  className="p-3 text-zinc-600 hover:text-red-500 transition-all active:scale-90"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
                <X size={28} />
              </button>

              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10">Add Course</h2>

              <form onSubmit={handleAddCourse} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block px-1">Code</label>
                    <input
                      required
                      placeholder="MTH101"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newCourse.code}
                      onChange={e => setNewCourse({...newCourse, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block px-1">Units</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="6"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newCourse.units}
                      onChange={e => setNewCourse({...newCourse, units: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block px-1">Title</label>
                  <input
                    placeholder="Course Title"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newCourse.title}
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block px-1">Grade</label>
                  <div className="grid grid-cols-3 gap-3">
                    {GRADING_SYSTEM.map(g => (
                      <button
                        key={g.grade}
                        type="button"
                        onClick={() => setNewCourse({...newCourse, grade: g.grade})}
                        className={`py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${newCourse.grade === g.grade ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                      >
                        {g.grade}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all active:scale-95 mt-4 shadow-xl"
                >
                  SAVE RECORD
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

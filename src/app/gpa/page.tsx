'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Calculator, ChevronLeft, Target, Sparkles, TrendingUp, X } from 'lucide-react'
import Link from 'next/link'
import { useCourses } from '@/hooks/useCourses'
import { MobileNav } from '@/components/MobileNav'
import { Course } from '@/lib/db'

const GRADING_SYSTEM = [
  { grade: 'A', points: 5, range: '70-100' },
  { grade: 'B', points: 4, range: '60-69' },
  { grade: 'C', points: 3, range: '50-59' },
  { grade: 'D', points: 2, range: '45-49' },
  { grade: 'E', points: 1, range: '40-44' },
  { grade: 'F', points: 0, range: '0-39' },
]

export default function GPACalculator() {
  const { courses, saveCourse, removeCourse } = useCourses()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCourse, setNewCourse] = useState({ code: '', title: '', units: 3, grade: 'A' })
  const [targetGPA, setTargetGPA] = useState('')
  const [prediction, setPrediction] = useState<string | null>(null)

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
    const points = GRADING_SYSTEM.find(g => g.grade === newCourse.grade)?.points || 0

    await saveCourse({
      id,
      ...newCourse,
      points
    })

    setNewCourse({ code: '', title: '', units: 3, grade: 'A' })
    setShowAddModal(false)
  }

  const predictGrades = () => {
    const target = parseFloat(targetGPA)
    if (isNaN(target) || target < 0 || target > 5) {
      setPrediction("Please enter a valid target GPA (0.00 - 5.00)")
      return
    }

    const currentTotalPoints = stats.totalPoints
    const currentTotalUnits = stats.totalUnits

    // Assume 3 more courses of 3 units each for prediction if no future courses known
    const futureUnits = 9
    const requiredTotalPoints = target * (currentTotalUnits + futureUnits)
    const neededFromFuture = requiredTotalPoints - currentTotalPoints
    const avgNeeded = neededFromFuture / futureUnits

    if (avgNeeded > 5) {
      setPrediction(`Mathematically impossible to reach ${target} GPA this semester with current units.`)
    } else if (avgNeeded <= 0) {
      setPrediction(`You are already above ${target} GPA!`)
    } else {
      const suggestedGrade = GRADING_SYSTEM.find(g => g.points >= avgNeeded)?.grade || 'A'
      setPrediction(`To reach ${target}, you need an average grade of ${suggestedGrade} in your remaining courses.`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-10 font-sans">
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors">
                <ChevronLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase">GPA ENGINE</h1>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> 5.0 Grading Scale
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-400 transition-all active:scale-95"
            >
              <Plus size={18} /> <span className="hidden md:inline">ADD COURSE</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* GPA Hero Card */}
        <div className="bg-emerald-500 text-black rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Current Academic Standing</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter">{stats.gpa}</h2>
              <span className="text-2xl font-black opacity-40">/ 5.00</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-black/10 pt-8">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60">Total Units</p>
                <p className="text-2xl font-black">{stats.totalUnits}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-60">Total Points</p>
                <p className="text-2xl font-black">{stats.totalPoints}</p>
              </div>
            </div>
          </div>
          <Calculator size={200} className="absolute right-[-40px] bottom-[-40px] opacity-10 rotate-12 pointer-events-none" />
        </div>

        {/* Prediction Tool */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-emerald-500" size={24} />
            <h3 className="text-sm font-black uppercase tracking-tight">Grade Predictor</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="number"
              step="0.01"
              placeholder="Target GPA (e.g. 4.50)"
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
              value={targetGPA}
              onChange={(e) => setTargetGPA(e.target.value)}
            />
            <button
              onClick={predictGrades}
              className="bg-zinc-100 text-black px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-white transition-all"
            >
              Analyze Goal
            </button>
          </div>
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold leading-relaxed"
            >
              <Sparkles size={14} className="inline mr-2 mb-1" /> {prediction}
            </motion.div>
          )}
        </div>

        {/* Course List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-zinc-500" /> Semester Courses
            </h3>
            <span className="text-[10px] font-black text-zinc-600 uppercase">{courses.length} Registered</span>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem]">
                 <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No courses added yet</p>
              </div>
            ) : courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-emerald-500 border border-zinc-700">
                    {course.grade}
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight">{course.code}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">{course.title || 'Untitled Course'} • {course.units} Units</p>
                  </div>
                </div>
                <button
                  onClick={() => removeCourse(course.id)}
                  className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Add Course</h2>
              <form onSubmit={handleAddCourse} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Course Code</label>
                    <input
                      required
                      placeholder="MTH101"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={newCourse.code}
                      onChange={e => setNewCourse({...newCourse, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Units</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="6"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={newCourse.units}
                      onChange={e => setNewCourse({...newCourse, units: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Course Title</label>
                  <input
                    placeholder="Algebra & Trigonometry"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={newCourse.title}
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Grade Obtained</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADING_SYSTEM.map(g => (
                      <button
                        key={g.grade}
                        type="button"
                        onClick={() => setNewCourse({...newCourse, grade: g.grade})}
                        className={`py-3 rounded-xl font-black text-xs transition-all ${newCourse.grade === g.grade ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                      >
                        {g.grade}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 mt-4"
                >
                  SAVE COURSE
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

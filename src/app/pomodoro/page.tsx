'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, ChevronLeft, Bell, Coffee, Brain, Settings } from 'lucide-react'
import Link from 'next/link'
import { MobileNav } from '@/components/MobileNav'
import { useNotification } from '@/hooks/useNotification'
import { recordStudyTime } from '@/utils/activity'

export default function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'study' | 'break'>('study')
  const [customTime, setCustomTime] = useState({ study: 25, break: 5 })
  const { sendNotification } = useNotification()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerEnd()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, timeLeft])

  const handleTimerEnd = () => {
    setIsActive(false)
    const title = mode === 'study' ? 'Study Session Finished!' : 'Break Over!'
    const body = mode === 'study' ? 'Time for a well-deserved break.' : 'Ready to focus again?'

    sendNotification(title, { body })

    if (mode === 'study') {
      recordStudyTime(customTime.study)
    }

    // Toggle mode
    const nextMode = mode === 'study' ? 'break' : 'study'
    setMode(nextMode)
    setTimeLeft(nextMode === 'study' ? customTime.study * 60 : customTime.break * 60)
  }

  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'study' ? customTime.study * 60 : customTime.break * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-10 font-sans flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Focus Timer</h1>
        <button className="p-2 text-zinc-500 hover:text-white"><Settings size={20} /></button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="mb-12 flex bg-zinc-900 p-1 rounded-2xl">
          <button
            onClick={() => { setMode('study'); setTimeLeft(customTime.study * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'study' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500'}`}
          >
            Study
          </button>
          <button
            onClick={() => { setMode('break'); setTimeLeft(customTime.break * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'break' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500'}`}
          >
            Break
          </button>
        </div>

        <div className="relative mb-16">
          <motion.div
            animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 4 }}
            className={`w-64 h-64 md:w-80 md:h-80 rounded-full border-4 flex flex-col items-center justify-center relative transition-colors ${mode === 'study' ? 'border-emerald-500/20' : 'border-blue-500/20'}`}
          >
             <div className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${mode === 'study' ? 'border-emerald-500' : 'border-blue-500'}`}
                  style={{ clipPath: `inset(${(1 - (timeLeft / ( (mode === 'study' ? customTime.study : customTime.break) * 60))) * 100}% 0 0 0)` }} />

             {mode === 'study' ? <Brain className="text-emerald-500 mb-4" size={32} /> : <Coffee className="text-blue-500 mb-4" size={32} />}
             <h2 className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums">{formatTime(timeLeft)}</h2>
          </motion.div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={resetTimer}
            className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
          >
            <RotateCcw size={24} />
          </button>
          <button
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all active:scale-90 shadow-2xl ${isActive ? 'bg-zinc-100 text-black' : 'bg-white text-black'}`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button
            onClick={() => sendNotification('Test Notification', { body: 'Notifications are working!' })}
            className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
          >
            <Bell size={24} />
          </button>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

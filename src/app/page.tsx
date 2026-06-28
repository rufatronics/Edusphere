'use client'

import { motion } from 'framer-motion'
import { BookOpen, Bot, MessageCircle, Users, ArrowRight, Shield, Globe, Zap, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-2xl font-black tracking-tighter flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-black text-xl font-black">E</span>
          </div>
          EDUSPHERE <span className="text-emerald-500">BUK</span>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-6"
        >
          <Link href="/login" className="text-sm font-medium hover:text-emerald-400 transition-colors">Login</Link>
          <Link href="/signup" className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Join Platform
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-8"
        >
          <Sparkles size={14} /> BUILT FOR THE NEXT GENERATION OF BUK STUDENTS
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
        >
          THE FUTURE OF <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-700">STUDYING</span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          An all-in-one digital ecosystem. Resources, AI tutoring, and private collaboration—designed specifically for Bayero University, Kano.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/signup" className="group px-8 py-4 bg-emerald-500 text-black rounded-2xl text-lg font-black hover:bg-emerald-400 transition-all flex items-center gap-2 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            GET STARTED FREE <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/resources" className="px-8 py-4 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 rounded-2xl text-lg font-bold transition-all backdrop-blur-sm">
            Browse Archive
          </Link>
        </motion.div>
      </header>

      {/* Feature Bento Grid */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {/* Main Feature - AI */}
          <motion.div variants={itemVariants} className="md:col-span-8 group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 hover:border-emerald-500/50 transition-colors">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-8">
                <Bot size={32} />
              </div>
              <h3 className="text-4xl font-black mb-4">AI TUTOR 2.0</h3>
              <p className="text-zinc-400 text-lg max-w-md">24/7 Academic assistance. Socratic mode to help you think, and Simplify mode for those "ELI5" moments.</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all" />
          </motion.div>

          {/* Side Feature - Resource */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 hover:border-emerald-500/50 transition-colors">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-8">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4">ARCHIVE</h3>
            <p className="text-zinc-400">Thousands of past questions & lecture notes at your fingertips.</p>
          </motion.div>

          {/* Privacy Feature */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 hover:border-emerald-500/50 transition-colors">
            <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-8">
              <Shield size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4">PRIVACY FIRST</h3>
            <p className="text-zinc-400">Messages auto-delete from our servers. Your conversations stay yours.</p>
          </motion.div>

          {/* Study Groups */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-emerald-500/50 transition-colors overflow-hidden relative">
            <div>
              <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mb-8">
                <Users size={32} />
              </div>
              <h3 className="text-4xl font-black mb-4">COLLABORATE</h3>
              <p className="text-zinc-400 text-lg">Join or create study groups for your specific BUK courses.</p>
            </div>
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-16 h-16 rounded-full bg-zinc-800 border-4 border-black flex items-center justify-center text-xs font-bold text-zinc-500">
                  U{i}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Quote */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center border-t border-zinc-900">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-12"
        >
          <div className="flex justify-center gap-1 text-emerald-500">
            {[1,2,3,4,5].map(i => <Zap key={i} size={20} fill="currentColor" />)}
          </div>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight">
            "EduSphere isn't just an app; it's the unfair advantage every BUK student deserves in 2026."
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="text-left">
              <p className="font-bold text-white">Chidi Ibrahim</p>
              <p className="text-sm text-zinc-500">Level 400, Computer Science</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-black tracking-tighter flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 bg-zinc-500 rounded flex items-center justify-center">
              <span className="text-black text-xs font-black">E</span>
            </div>
            EDUSPHERE
          </div>
          <div className="flex gap-8 text-sm font-medium text-zinc-500">
            <Link href="#" className="hover:text-emerald-500">Twitter</Link>
            <Link href="#" className="hover:text-emerald-500">GitHub</Link>
            <Link href="#" className="hover:text-emerald-500">Terms</Link>
            <Link href="#" className="hover:text-emerald-500">Privacy</Link>
          </div>
          <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">
            Made with ❤️ for BUK Students
          </p>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-emerald-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-10 rounded-[2.5rem] relative z-10"
      >
        <div className="flex justify-center mb-8">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <span className="text-black text-2xl font-black">E</span>
           </div>
        </div>

        <h1 className="text-3xl font-black tracking-tighter text-center uppercase mb-2">Access Portal</h1>
        <p className="text-zinc-500 text-xs font-bold text-center uppercase tracking-widest mb-10">Bayero University Study Ecosystem</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold mb-6 text-center uppercase tracking-tight">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
             <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
             <input
               type="email"
               className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               placeholder="name@buk.edu.ng"
             />
          </div>
          <div>
             <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Password</label>
             <input
               type="password"
               className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               placeholder="••••••••"
             />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 mt-6 shadow-lg shadow-white/5"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold text-zinc-600 uppercase tracking-tight">
          New to EduSphere?{' '}
          <Link href="/signup" className="text-emerald-500 hover:underline">
            Register Account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

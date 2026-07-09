'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

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

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }
    } catch (e: any) {
      setError(e.message || "Failed to connect to authentication server. Check your connection or configuration.")
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
        className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] relative z-10"
      >
        <Link href="/" className="absolute top-8 left-8 p-2 text-zinc-600 hover:text-white transition-colors">
           <Home size={20} />
        </Link>
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

        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/dashboard" } })}
          className="w-full bg-zinc-900 border border-zinc-800 text-white py-4 rounded-[1.25rem] font-bold text-sm mb-6 flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div className="relative flex items-center gap-4 mb-6">
          <div className="flex-1 h-[1px] bg-zinc-900"></div>
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-[1px] bg-zinc-900"></div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
             <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
             <input
               type="email"
               className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
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
               className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               placeholder="••••••••"
             />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-4 md:py-5 rounded-[1.25rem] md:rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 mt-6 shadow-lg shadow-white/5"
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

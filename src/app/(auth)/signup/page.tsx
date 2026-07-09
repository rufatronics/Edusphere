'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BUK_FACULTIES, BUK_LEVELS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { ShieldCheck, Home } from 'lucide-react'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [level, setLevel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError('Agreement to terms is mandatory for student registry.')
      return
    }
    if (password !== confirmPassword) {
      setError('Security keys do not match. Please verify.')
      return
    }
    if (password.length < 8) {
      setError('Security key must be at least 8 characters long.')
      return
    }
    if (!email.endsWith('@buk.edu.ng')) {
      if (!confirm('You are not using a BUK email address. Continue anyway?')) return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            department,
            level,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('rate limit exceeded')) {
          setError('BUK Registry is currently at maximum capacity. Please notify the administrator to increase auth limits or try again in 1 hour.')
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        // Profile is now automatically created via Supabase Database Trigger
        router.push('/dashboard')
      }
    } catch (e: any) {
      setError(e.message || "Registry unreachable. Please verify your credentials or try again later.")
      setLoading(false)
    }

  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-emerald-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-900 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] relative z-10"
      >
        <Link href="/" className="absolute top-8 left-8 p-2 text-zinc-600 hover:text-white transition-colors">
           <Home size={20} />
        </Link>
        <div className="flex justify-center mb-8">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <span className="text-black text-2xl font-black">E</span>
           </div>
        </div>

        <h1 className="text-3xl font-black tracking-tighter text-center uppercase mb-2">Student Registry</h1>
        <p className="text-zinc-500 text-xs font-bold text-center uppercase tracking-widest mb-10">Join 1,000+ BUK Scholars Online</p>

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
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
               <input
                 type="text"
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 required
                 placeholder="Chidi Ibrahim"
               />
            </div>
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
               <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Security Key</label>
               <input
                 type="password"
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 placeholder="min. 8 chars"
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Verify Key</label>
               <input
                 type="password"
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 required
                 placeholder="repeat key"
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Department</label>
               <select
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                 value={department}
                 onChange={(e) => setDepartment(e.target.value)}
                 required
               >
                 <option value="" className="bg-zinc-950">Select Faculty</option>
                 {BUK_FACULTIES.map((fac) => (
                   <option key={fac} value={fac} className="bg-zinc-950">{fac}</option>
                 ))}
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Current Level</label>
               <select
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 md:px-6 py-3 md:py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                 value={level}
                 onChange={(e) => setLevel(e.target.value)}
                 required
               >
                 <option value="">Select Level</option>
                 {BUK_LEVELS.map((lvl) => (
                   <option key={lvl} value={lvl}>{lvl}</option>
                 ))}
               </select>
            </div>
          </div>

          <div className="flex items-start gap-3 px-1">
             <input
               type="checkbox"
               id="terms"
               checked={agreed}
               onChange={(e) => setAgreed(e.target.checked)}
               className="mt-1 accent-emerald-500"
             />
             <label htmlFor="terms" className="text-[10px] font-medium text-zinc-500 leading-relaxed">
               I agree to the <Link href="/terms" className="text-emerald-400 underline">Terms of Use</Link> and <Link href="/privacy" className="text-emerald-400 underline">Privacy Policy</Link>. I understand that EduSphere BUK is an educational tool and takes no responsibility for exam outcomes or data accuracy.
             </label>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-4 md:py-5 rounded-[1.25rem] md:rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-white/5 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating Profile...' : 'Begin Academic Journey'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold text-zinc-600 uppercase tracking-tight">
          Already a member?{' '}
          <Link href="/login" className="text-emerald-500 hover:underline">
            Login Now
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

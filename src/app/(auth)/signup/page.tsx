'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

const BUK_FACULTIES = [
  'Agriculture', 'Arts & Islamic Studies', 'Basic Medical Sciences', 'Clinical Sciences',
  'Computing', 'Education', 'Engineering', 'Law', 'Life Sciences', 'Management Sciences',
  'Pharmaceutical Sciences', 'Physical Sciences', 'Social Sciences', 'Communication'
]

const BUK_LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L', 'Postgraduate']

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    // Robust Password Validation
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('rate limit exceeded')) {
          setError('BUK Registry is currently at maximum capacity. Please try again in 1 hour.')
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        // Redirect to dashboard, but inform user if email confirmation is required
        if (data.session) {
          router.push('/dashboard')
        } else {
          setError('Success! Please check your email to verify your account.')
          setLoading(false)
        }
      }
    } catch (e: any) {
      setError(e.message || "Registry unreachable. Please verify your credentials or try again later.")
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-emerald-500/30 font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-900 p-6 md:p-12 rounded-[2.5rem] relative z-10"
      >
        <Link href="/" className="absolute top-8 left-8 p-2 text-zinc-600 hover:text-white transition-colors">
           <Home size={20} />
        </Link>

        <div className="flex justify-center mb-8">
           <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-black text-2xl font-black italic">E</span>
           </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-center uppercase mb-2 leading-none">Student Registry</h1>
        <p className="text-zinc-500 text-[10px] font-black text-center uppercase tracking-[0.3em] mb-12">Join The BUK Intelligence Network</p>

        {error && (
          <div className={`p-5 rounded-2xl text-[11px] font-black mb-8 text-center uppercase tracking-widest ${error.includes('Success') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignUp}
          className="w-full bg-zinc-900 border border-zinc-800 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest mb-10 flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all active:scale-95 shadow-xl"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sync with Google
        </button>

        <div className="relative flex items-center gap-6 mb-10">
          <div className="flex-1 h-[1px] bg-zinc-900"></div>
          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">Manual Entry</span>
          <div className="flex-1 h-[1px] bg-zinc-900"></div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
               <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Full Name</label>
               <input
                 type="text"
                 className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold"
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 required
                 placeholder="Enter student name"
               />
            </div>
            <div>
               <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Email Address</label>
               <input
                 type="email"
                 className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 placeholder="id@buk.edu.ng"
               />
            </div>
            <div>
               <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Security Key</label>
               <input
                 type="password"
                 className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 placeholder="min. 8 chars"
               />
            </div>
            <div>
               <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Verify Key</label>
               <input
                 type="password"
                 className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 required
                 placeholder="repeat key"
               />
            </div>
            <div>
               <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Faculty</label>
               <select
                 className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold appearance-none cursor-pointer"
                 value={department}
                 onChange={(e) => setDepartment(e.target.value)}
                 required
               >
                 <option value="">Select Faculty</option>
                 {BUK_FACULTIES.map((fac) => (
                   <option key={fac} value={fac}>{fac}</option>
                 ))}
               </select>
            </div>
            <div>
               <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Current Level</label>
               <select
                 className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold appearance-none cursor-pointer"
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

          <div className="flex items-start gap-4 px-1 py-4">
             <input
               type="checkbox"
               id="terms"
               checked={agreed}
               onChange={(e) => setAgreed(e.target.checked)}
               className="mt-1 w-5 h-5 accent-emerald-500 rounded-lg"
             />
             <label htmlFor="terms" className="text-[10px] font-bold text-zinc-600 leading-relaxed uppercase tracking-widest">
               Agree to <Link href="/terms" className="text-emerald-500 underline">Terms of Use</Link> and <Link href="/privacy" className="text-emerald-500 underline">Privacy Protocol</Link>. BUK edusphere is a research utility.
             </label>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Authorize Registration'}
          </button>
        </form>

        <p className="mt-12 text-center text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
          Existing Node?{' '}
          <Link href="/login" className="text-emerald-500 hover:underline">
            Identify Here
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

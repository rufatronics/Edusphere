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
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email,
              department,
              level,
            },
          ])

        if (profileError) {
          setError(profileError.message)
          setLoading(false)
          return
        }

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
        className="w-full max-w-xl bg-zinc-950 border border-zinc-900 p-10 rounded-[2.5rem] relative z-10"
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

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
               <input
                 type="text"
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
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
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
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
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
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
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 required
                 placeholder="repeat key"
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Department</label>
               <select
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
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
                 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
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
            className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-white/5 disabled:opacity-50"
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

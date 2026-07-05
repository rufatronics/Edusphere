'use client'

// import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-20 selection:bg-emerald-500/30">
      <Link href="/signup" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 mb-12 font-bold uppercase text-xs">
        <ChevronLeft size={16} /> Back to Registry
      </Link>

      <div className="max-w-3xl mx-auto bg-zinc-950 border border-zinc-900 p-10 md:p-20 rounded-[3rem]">
        <Lock size={48} className="text-emerald-500 mb-8" />
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">Privacy Protocol</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-12">Security Standard BUK-01</p>

        <div className="space-y-8 text-zinc-400 leading-relaxed font-medium">
          <section>
            <h2 className="text-white font-black uppercase text-sm mb-4 tracking-tight">1. Ephemeral Messaging</h2>
            <p>Your privacy is our priority. Direct messages and group chats are temporary. They are automatically purged from our servers 1 hour after delivery (or 24 hours if undelivered). We do not keep logs of your private conversations.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase text-sm mb-4 tracking-tight">2. Data Collection</h2>
            <p>We only collect your basic academic profile (Name, BUK Email, Department, Level) to facilitate study circles. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase text-sm mb-4 tracking-tight">3. Real-time Presence</h2>
            <p>To enable collaboration, your "Online" status is visible to other registered BUK students. You can manage visibility in your dashboard settings.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase text-sm mb-4 tracking-tight">4. Security Disclaimer</h2>
            <p>While we use industry-standard encryption, no system is 100% secure. <strong>WE TAKE NO RISK</strong> for unauthorized access to your device or account. Use strong passwords and keep your session private.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, Shield } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-20 selection:bg-emerald-500/30">
      <Link href="/signup" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 mb-12 font-bold uppercase text-xs">
        <ChevronLeft size={16} /> Back to Registry
      </Link>

      <div className="max-w-3xl mx-auto bg-zinc-950 border border-zinc-900 p-10 md:p-20 rounded-[3rem]">
        <Shield size={48} className="text-emerald-500 mb-8" />
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">Terms of Use</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-12">Effective: 2026 Academic Session</p>

        <div className="space-y-8 text-zinc-400 leading-relaxed font-medium">
          <section>
            <h2 className="text-white font-black uppercase text-sm mb-4 tracking-tight">1. Platform Purpose</h2>
            <p>EduSphere BUK is an educational ecosystem designed to facilitate resource sharing and AI-assisted learning. It is not an official organ of Bayero University, Kano.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase text-sm mb-4 tracking-tight">2. No Liability</h2>
            <p><strong>WE TAKE NO RISK.</strong> EduSphere BUK, its creators, and contributors are not responsible for any academic failure, exam disqualification, or data loss. Users utilize the platform at their own risk. The AI Tutor may provide inaccurate information; always verify with official lecture notes.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase text-sm mb-4 tracking-tight">3. Resource Sharing</h2>
            <p>By uploading resources, you confirm that you have the right to share them. We reserve the right to remove any content that violates intellectual property or BUK guidelines.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase text-sm mb-4 tracking-tight">4. Conduct</h2>
            <p>Harassment, spamming, or sharing non-academic content in peer circles will result in immediate permanent suspension from the portal.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

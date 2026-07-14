'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-12 border-t border-zinc-900 mt-20 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
        <p>© 2026 EDUSPHERE BUK • BEYOND ACADEMICS</p>
        <div className="flex gap-8">
          <Link href="/terms" className="hover:text-emerald-500 transition-colors">Terms of Use</Link>
          <Link href="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Protocol</Link>
          <Link href="/dashboard" className="hover:text-emerald-500 transition-colors">System Status</Link>
        </div>
      </div>
    </footer>
  )
}

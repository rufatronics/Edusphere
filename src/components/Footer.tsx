import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-12 px-6 bg-black">
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
          <Link href="/terms" className="hover:text-emerald-500">Terms</Link>
          <Link href="/privacy" className="hover:text-emerald-500">Privacy</Link>
        </div>
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">
          Made with ❤️ for BUK Students
        </p>
      </div>
    </footer>
  )
}

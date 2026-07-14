'use client'

import { LayoutDashboard, BookOpen, Bot, MessageCircle, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: 'Archive', icon: <BookOpen size={20} />, href: '/resources' },
    { name: 'Planner', icon: <Calendar size={20} />, href: '/planner' },
    { name: 'GPA', icon: <TrendingUp size={20} />, href: '/gpa' },
    { name: 'AI', icon: <Bot size={20} />, href: '/ai-tutor' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-2xl border-t border-zinc-900 px-4 py-4 md:hidden safe-area-bottom">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${isActive ? 'text-emerald-500' : 'text-zinc-500'}`}
            >
              <div className={`p-2 rounded-2xl transition-colors ${isActive ? 'bg-emerald-500/10' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

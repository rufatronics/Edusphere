'use client'

import { LayoutDashboard, BookOpen, Bot, MessageCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: 'Archive', icon: <BookOpen size={20} />, href: '/resources' },
    { name: 'AI Tutor', icon: <Bot size={20} />, href: '/ai-tutor' },
    { name: 'Chat', icon: <MessageCircle size={20} />, href: '/chat' },
    { name: 'Groups', icon: <Users size={20} />, href: '/groups' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-2 py-3 md:hidden">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-emerald-500' : 'text-zinc-500 active:scale-90'}`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-emerald-500/10' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

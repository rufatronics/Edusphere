'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BookOpen, Bot, MessageCircle, Users, Award, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-primary">EduSphere BUK</div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-primary font-medium">Login</Link>
          <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-full hover:bg-opacity-90 font-medium shadow-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Your All-in-One <span className="text-primary">Study Ecosystem</span> at BUK
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Access past questions, chat with an AI tutor, collaborate in study groups, and track your progress—all for free.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="px-8 py-4 bg-primary text-white rounded-full text-lg font-bold hover:bg-opacity-90 shadow-lg">Join 1000+ Students</Link>
          <Link href="/resources" className="px-8 py-4 border-2 border-primary text-primary rounded-full text-lg font-bold hover:bg-green-50">Browse Resources</Link>
        </div>
      </header>

      {/* Features */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 text-primary rounded-2xl flex items-center justify-center mb-6">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Resource Hub</h3>
            <p className="text-gray-600">Search and download past questions and lecture notes by course code or department.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Bot size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Tutor</h3>
            <p className="text-gray-600">Get 24/7 academic help. Use Socratic mode to learn faster or simplify mode for complex topics.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 text-primary rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Privacy-First Chat</h3>
            <p className="text-gray-600">WhatsApp-style chat that respects your privacy. Messages auto-delete from the server after delivery.</p>
          </div>
        </div>
      </section>

      {/* Trust/Privacy section */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
          <ShieldCheck size={16} /> 100% Privacy Focused
        </div>
        <h2 className="text-3xl font-bold mb-6">Built Specifically for Bayero University Students</h2>
        <p className="text-gray-600 mb-10 italic">"EduSphere helps me find old exam papers in seconds and the AI tutor is like having a private teacher available even at 2 AM."</p>
        <div className="flex items-center justify-center gap-4">
           <div className="flex -space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white"></div>
              <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white"></div>
              <div className="w-10 h-10 bg-gray-400 rounded-full border-2 border-white"></div>
           </div>
           <span className="text-sm font-medium text-gray-500">Join students from Engineering, Law, CS, and more.</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 text-center text-gray-500 text-sm">
        <p>© 2024 EduSphere BUK. Empowering BUK Students.</p>
      </footer>
    </div>
  )
}

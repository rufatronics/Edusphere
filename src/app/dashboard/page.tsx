import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">EduSphere BUK</h1>
            <p className="text-gray-600">Welcome back, {profile?.full_name || 'Student'}!</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white p-2 rounded shadow text-sm">
                🔥 Streak: {profile?.study_streak || 0} days
             </div>
             <form action="/auth/signout" method="post">
                <button className="text-sm text-gray-500 hover:text-red-500">Sign Out</button>
             </form>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
            <Link href="/resources" className="p-4 bg-primary text-white rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:scale-95">
              <span className="text-xl">📚</span>
                <span className="text-sm font-medium">Resources</span>
            </Link>
            <Link href="/ai-tutor" className="p-4 bg-primary text-white rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:scale-95">
              <span className="text-xl">🤖</span>
                <span className="text-sm font-medium">AI Tutor</span>
            </Link>
            <Link href="/chat" className="p-4 bg-primary text-white rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:scale-95">
              <span className="text-xl">💬</span>
                <span className="text-sm font-medium">Chat</span>
            </Link>
            <Link href="/groups" className="p-4 bg-primary text-white rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:scale-95">
              <span className="text-xl">👥</span>
                <span className="text-sm font-medium">Groups</span>
            </Link>
            </div>
          </section>

          {/* Activity Feed */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="text-sm text-gray-500 italic text-center py-8">
              No recent activity to show.
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

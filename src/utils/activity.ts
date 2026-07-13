import { createClient } from '@/lib/supabase/client'
import { getDB, StudyStats } from '@/lib/db'

export async function trackActivity(type: 'task' | 'resource' | 'study' = 'study') {
  // 1. Sync with Supabase for the global streak (Cloud Sync)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_activity_at, study_streak')
      .eq('id', user.id)
      .single()

    if (profile) {
      const lastDateStr = profile.last_activity_at ? new Date(profile.last_activity_at).toDateString() : null
      const todayStr = new Date().toDateString()

      if (lastDateStr !== todayStr) {
         const lastDate = profile.last_activity_at ? new Date(profile.last_activity_at) : null
         const yesterday = new Date()
         yesterday.setDate(yesterday.getDate() - 1)

         let newStreak = profile.study_streak || 0
         if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
           newStreak += 1
         } else {
           newStreak = 1
         }

         await supabase
           .from('profiles')
           .update({
             study_streak: newStreak,
             last_activity_at: new Date().toISOString()
           })
           .eq('id', user.id)
      }
    }
  }

  // 2. Track granular metrics locally in IndexedDB
  const db = await getDB()
  if (!db) return

  const today = new Date().toISOString().split('T')[0]
  const existingStats = await db.get('stats', today)

  const stats: StudyStats = existingStats || {
    date: today,
    hoursStudied: 0,
    tasksCompleted: 0,
    resourcesOpened: 0
  }

  if (type === 'task') stats.tasksCompleted += 1
  if (type === 'resource') stats.resourcesOpened += 1
  // For 'study', we'll track time elsewhere (Pomodoro), but we record the activity today

  await db.put('stats', stats)
}

export async function recordStudyTime(minutes: number) {
  const db = await getDB()
  if (!db) return

  const today = new Date().toISOString().split('T')[0]
  const existingStats = await db.get('stats', today)

  const stats: StudyStats = existingStats || {
    date: today,
    hoursStudied: 0,
    tasksCompleted: 0,
    resourcesOpened: 0
  }

  stats.hoursStudied += (minutes / 60)
  await db.put('stats', stats)
}

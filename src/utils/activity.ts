import { createClient } from '@/lib/supabase/client'

export async function trackActivity() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

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

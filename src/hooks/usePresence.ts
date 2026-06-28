'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePresence(channelName: string = 'global_presence') {
  const supabase = createClient()
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({})

  useEffect(() => {
    const initPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: user.id,
          },
        },
      })

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          setOnlineUsers(state)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('leave', key, leftPresences)
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            })
          }
        })

      return () => {
        channel.unsubscribe()
      }
    }

    initPresence()
  }, [channelName])

  const isUserOnline = (userId: string) => {
    return !!onlineUsers[userId]
  }

  return { onlineUsers, isUserOnline }
}

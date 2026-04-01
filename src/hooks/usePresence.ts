import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'

export function usePresence(roomCode: string | undefined) {
  const [onlineCount, setOnlineCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionId = getSessionId()

  useEffect(() => {
    if (!roomCode) return

    const channel = supabase.channel(`presence-${roomCode}`, {
      config: { presence: { key: sessionId } },
    })

    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload?.session_id === sessionId) return
        setIsTyping(true)
        if (typingTimer.current) clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setIsTyping(false), 3000)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            session_id: sessionId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
      supabase.removeChannel(channel)
    }
  }, [roomCode, sessionId])

  const broadcastTyping = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { session_id: sessionId },
    })
  }, [sessionId])

  return { onlineCount, isTyping, broadcastTyping }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { updateStreak } from '../lib/streak'
import type { Message, ReactionType, Room } from '../lib/types'

export function useMessages(room: Room | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const sessionId = getSessionId()
  const destructTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Schedule self-destruct deletion on client
  const scheduleSelfDestruct = useCallback((msg: Message) => {
    if (!msg.self_destruct_at) return
    const ms = new Date(msg.self_destruct_at).getTime() - Date.now()
    if (ms <= 0) return
    const timer = setTimeout(async () => {
      await supabase.from('messages').delete().eq('id', msg.id)
    }, ms)
    destructTimers.current.set(msg.id, timer)
  }, [])

  const fetchMessages = useCallback(async (roomId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
    return (data ?? []) as Message[]
  }, [])

  useEffect(() => {
    if (!room) return
    setLoading(true)

    let realtimeWorking = false

    fetchMessages(room.id).then(msgs => {
      setMessages(msgs)
      msgs.forEach(scheduleSelfDestruct)
      setLoading(false)
    })

    const channel = supabase
      .channel(`room-messages-${room.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
        ({ new: msg }) => {
          realtimeWorking = true
          const newMsg = msg as Message
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
          scheduleSelfDestruct(newMsg)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
        ({ new: msg }) => {
          realtimeWorking = true
          setMessages(prev => prev.map(m => (m.id === msg.id ? (msg as Message) : m)))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
        ({ old: msg }) => {
          realtimeWorking = true
          setMessages(prev => prev.filter(m => m.id !== msg.id))
          const timer = destructTimers.current.get(msg.id)
          if (timer) {
            clearTimeout(timer)
            destructTimers.current.delete(msg.id)
          }
        }
      )
      .subscribe()

    // Polling fallback — kicks in if realtime hasn't fired within 6 seconds
    const pollInterval = setInterval(async () => {
      if (realtimeWorking) return
      const msgs = await fetchMessages(room.id)
      setMessages(msgs)
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
      destructTimers.current.forEach(t => clearTimeout(t))
      destructTimers.current.clear()
    }
  }, [room, scheduleSelfDestruct, fetchMessages])

  const sendMessage = useCallback(
    async (params: {
      content: string
      type?: Message['message_type']
      selfDestructMinutes?: number
      replyTo?: Message | null
      pollOptions?: string[]
      bombPrompt?: string
      bombHours?: number
    }) => {
      if (!room) return

      const {
        content,
        type = 'regular',
        selfDestructMinutes,
        replyTo,
        pollOptions,
        bombPrompt,
        bombHours,
      } = params

      const payload: Partial<Message> = {
        room_id: room.id,
        content,
        message_type: type,
        session_id: sessionId,
      }

      if (selfDestructMinutes) {
        payload.self_destruct_at = new Date(
          Date.now() + selfDestructMinutes * 60 * 1000
        ).toISOString()
      }

      if (replyTo) {
        payload.reply_to_id = replyTo.id
        payload.reply_preview = replyTo.content.slice(0, 80)
      }

      if (type === 'poll' && pollOptions) {
        payload.poll_options = pollOptions
        payload.poll_votes = {}
      }

      if (type === 'ticking_bomb' && bombPrompt && bombHours) {
        payload.bomb_prompt = bombPrompt
        payload.bomb_expires_at = new Date(Date.now() + bombHours * 3600 * 1000).toISOString()
        payload.bomb_answers = []
      }

      const { data: inserted } = await supabase.from('messages').insert(payload).select().single()
      if (inserted) {
        setMessages(prev =>
          prev.some(m => m.id === inserted.id) ? prev : [...prev, inserted as Message]
        )
        scheduleSelfDestruct(inserted as Message)
      }
      await updateStreak(room)

      // Update daily stats
      const today = new Date().toISOString().split('T')[0]
      try {
        await supabase.rpc('upsert_room_stats', {
          p_room_id: room.id,
          p_date: today,
          p_is_confession: type === 'confession',
        })
      } catch {
        // Fallback: manual upsert
        await supabase.from('room_stats')
          .upsert(
            {
              room_id: room.id,
              date: today,
              message_count: 1,
              confession_count: type === 'confession' ? 1 : 0,
            },
            { onConflict: 'room_id,date', ignoreDuplicates: false }
          )
      }
    },
    [room, sessionId, scheduleSelfDestruct]
  )

  const reactToMessage = useCallback(
    async (message: Message, reaction: ReactionType) => {
      const sessionReactions: string[] = message.reacted_sessions?.[sessionId] ?? []
      const hasReacted = sessionReactions.includes(reaction)

      const updatedSessionReactions = hasReacted
        ? sessionReactions.filter(r => r !== reaction)
        : [...sessionReactions, reaction]

      const delta = hasReacted ? -1 : 1

      const colKey = `reaction_${reaction}` as keyof Message
      const currentCount = (message[colKey] as number) ?? 0
      const newCount = Math.max(0, currentCount + delta)

      const updatedReactedSessions = {
        ...(message.reacted_sessions ?? {}),
        [sessionId]: updatedSessionReactions,
      }

      const totalDelta =
        Object.values(updatedReactedSessions).reduce((sum, arr) => sum + arr.length, 0) -
        Object.values(message.reacted_sessions ?? {}).reduce((sum, arr) => sum + (arr as string[]).length, 0)

      const optimisticUpdate = {
        [`reaction_${reaction}`]: newCount,
        reacted_sessions: updatedReactedSessions,
        total_reactions: Math.max(0, message.total_reactions + totalDelta),
      }
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, ...optimisticUpdate } : m))

      await supabase
        .from('messages')
        .update(optimisticUpdate)
        .eq('id', message.id)
    },
    [sessionId]
  )

  const votePoll = useCallback(
    async (message: Message, optionIndex: number) => {
      const votes = { ...(message.poll_votes ?? {}) }
      if (votes[sessionId] !== undefined) return // already voted
      votes[sessionId] = String(optionIndex)
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, poll_votes: votes } : m))
      await supabase.from('messages').update({ poll_votes: votes }).eq('id', message.id)
    },
    [sessionId]
  )

  const answerBomb = useCallback(
    async (message: Message, answer: string) => {
      const answers = [...(message.bomb_answers ?? []), answer]
      await supabase.from('messages').update({ bomb_answers: answers }).eq('id', message.id)
    },
    []
  )

  const pinMessage = useCallback(async (message: Message) => {
    await supabase
      .from('messages')
      .update({ is_pinned: !message.is_pinned })
      .eq('id', message.id)
  }, [])

  return {
    messages,
    loading,
    sendMessage,
    reactToMessage,
    votePoll,
    answerBomb,
    pinMessage,
    sessionId,
  }
}

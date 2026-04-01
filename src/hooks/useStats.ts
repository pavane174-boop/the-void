import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { RoomStats } from '../lib/types'

export function useStats(roomId: string | undefined) {
  const [stats, setStats] = useState<RoomStats[]>([])
  const [todayStats, setTodayStats] = useState<RoomStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return
    setLoading(true)

    const today = new Date().toISOString().split('T')[0]

    supabase
      .from('room_stats')
      .select('*')
      .eq('room_id', roomId)
      .order('date', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        const rows = (data ?? []) as RoomStats[]
        setStats(rows)
        setTodayStats(rows.find(r => r.date === today) ?? null)
        setLoading(false)
      })
  }, [roomId])

  return { stats, todayStats, loading }
}

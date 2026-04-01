import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Room } from '../lib/types'

export function useRoom(code: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    setError(null)

    supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError('void not found')
        } else {
          setRoom(data as Room)
        }
        setLoading(false)
      })

    // Subscribe to room updates (streak, etc.)
    const channel = supabase
      .channel(`room-meta-${code}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code.toUpperCase()}` },
        ({ new: updated }) => {
          setRoom(updated as Room)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [code])

  return { room, loading, error, setRoom }
}

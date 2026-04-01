import { supabase } from './supabase'
import type { Room } from './types'

export async function updateStreak(room: Room): Promise<number> {
  const now = new Date()
  const lastActivity = new Date(room.last_activity_at)
  const hoursSince = (now.getTime() - lastActivity.getTime()) / 3600000

  let newStreak = room.streak_count

  if (hoursSince > 48) {
    // Missed a day — reset streak
    newStreak = 1
  } else if (hoursSince > 20) {
    // New day activity — increment streak
    newStreak = room.streak_count + 1
  }
  // Same-day activity: no change to streak count

  await supabase
    .from('rooms')
    .update({
      streak_count: newStreak,
      last_activity_at: now.toISOString(),
    })
    .eq('id', room.id)

  return newStreak
}

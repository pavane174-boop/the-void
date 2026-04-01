import type { Message, VibeType } from './types'

export function calculateVibe(messages: Message[]): VibeType {
  const recent = messages.slice(-20)
  if (recent.length < 2) return 'chill'

  // Average seconds between messages
  const times = recent.map(m => new Date(m.created_at).getTime())
  let totalGap = 0
  for (let i = 1; i < times.length; i++) {
    totalGap += times[i] - times[i - 1]
  }
  const avgGapSec = totalGap / (times.length - 1) / 1000

  const confessionCount = recent.filter(m => m.message_type === 'confession').length
  const confessionRatio = confessionCount / recent.length

  const heartCount = recent.reduce((sum, m) => sum + m.reaction_heart, 0)
  const fireCount = recent.reduce((sum, m) => sum + m.reaction_fire, 0)
  const totalMsgs = recent.length

  if (avgGapSec < 15) return 'unhinged'
  if (avgGapSec < 30) return 'chaotic'
  if (confessionRatio > 0.4) return 'deep'
  if (fireCount / Math.max(totalMsgs, 1) > 2) return 'wild'
  if (heartCount / Math.max(totalMsgs, 1) > 2) return 'melancholy'
  return 'chill'
}

export const VIBE_LABELS: Record<VibeType, string> = {
  chaotic: 'chaotic',
  chill: 'chill',
  wild: 'wild',
  deep: 'deep',
  unhinged: 'unhinged',
  melancholy: 'moody',
}

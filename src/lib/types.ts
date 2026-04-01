export interface Room {
  id: string
  code: string
  name: string
  max_members: number
  features: {
    confessions: boolean
    self_destruct: boolean
    polls: boolean
    ticking_bombs: boolean
  }
  streak_count: number
  last_activity_at: string
  streak_last_reset_at: string
  created_at: string
}

export interface Message {
  id: string
  room_id: string
  content: string
  message_type: 'regular' | 'confession' | 'poll' | 'ticking_bomb' | 'self_destruct' | 'pinned'
  self_destruct_at: string | null
  is_pinned: boolean
  reply_to_id: string | null
  reply_preview: string | null
  poll_options: string[] | null
  poll_votes: Record<string, string> | null   // { sessionId: optionIndex }
  bomb_prompt: string | null
  bomb_expires_at: string | null
  bomb_answers: string[]
  reaction_fire: number
  reaction_skull: number
  reaction_eyes: number
  reaction_heart: number
  reaction_diamond: number
  reacted_sessions: Record<string, string[]>  // { sessionId: ['fire','skull',...] }
  total_reactions: number
  session_id: string | null
  created_at: string
}

export interface RoomMember {
  id: string
  room_id: string
  session_id: string
  is_online: boolean
  last_seen_at: string
  created_at: string
}

export interface RoomStats {
  id: string
  room_id: string
  date: string
  message_count: number
  confession_count: number
  vibe: VibeType
}

export type VibeType = 'chaotic' | 'chill' | 'wild' | 'deep' | 'unhinged' | 'melancholy'

export type ReactionType = 'fire' | 'skull' | 'eyes' | 'heart' | 'diamond'

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  heart: '❤️',
  fire: '👍',
  skull: '😂',
  eyes: '😮',
  diamond: '🙏',
}

export const REACTION_KEYS: ReactionType[] = ['heart', 'fire', 'skull', 'eyes', 'diamond']

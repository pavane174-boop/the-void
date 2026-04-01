import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRoom } from '../hooks/useRoom'
import { useMessages } from '../hooks/useMessages'
import { useStats } from '../hooks/useStats'
import { ThemeToggle } from '../components/ThemeToggle'
import { Badge } from '../components/Badge'
import { VibeChip } from '../components/VibeChip'
import { REACTION_EMOJIS, REACTION_KEYS } from '../lib/types'
import type { VibeType } from '../lib/types'

export function RoomStats() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { room, loading: roomLoading } = useRoom(code)
  const { messages } = useMessages(room)
  const { stats, todayStats } = useStats(room?.id)

  const totalMessages = messages.length
  const totalConfessions = messages.filter(m => m.message_type === 'confession').length

  const reactionTotals = REACTION_KEYS.map(r => ({
    reaction: r,
    count: messages.reduce((sum, m) => sum + ((m[`reaction_${r}` as keyof typeof m] as number) || 0), 0),
  })).sort((a, b) => b.count - a.count)

  const maxReaction = reactionTotals[0]?.count || 1

  const vibe5Days = stats.slice(0, 5).reverse()

  // Badges
  const hasDiamond = messages.some(m => m.reaction_diamond > 0)
  const hasBombs = messages.filter(m => m.message_type === 'ticking_bomb').length >= 10
  const hasHallOfFame = messages.filter(m => m.total_reactions >= 20).length >= 5

  const badges = [
    { emoji: '🔥', label: 'Streak King', earned: (room?.streak_count ?? 0) > 7 },
    { emoji: '🌙', label: 'Night Owls', earned: true },
    { emoji: '💎', label: 'Rare Finder', earned: hasDiamond },
    { emoji: '👻', label: 'Ghost Mode', earned: true },
    { emoji: '💣', label: 'Bomb Squad', earned: hasBombs },
    { emoji: '🏆', label: 'Hall of Famers', earned: hasHallOfFame },
  ]

  if (roomLoading) {
    return (
      <div style={{ height: '100dvh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => navigate(`/room/${code}`)}
          className="w-9 h-9 flex items-center justify-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="font-grotesk font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            room stats
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{room?.name}</p>
        </div>
        <ThemeToggle />
      </div>

      <motion.div
        className="flex-1 overflow-y-auto scroll-ios"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {[
            { label: 'messages', value: totalMessages, color: 'var(--text-primary)' },
            { label: 'confessions', value: totalConfessions, color: 'var(--confession-label)' },
            { label: `streak 🔥`, value: room?.streak_count ?? 0, color: 'var(--streak)' },
            { label: "today's vibe", value: null, vibe: todayStats?.vibe as VibeType ?? 'chill', color: 'var(--accent)' },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-card p-4 flex flex-col gap-1"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <span
                className="font-grotesk font-bold text-2xl"
                style={{ color: card.color }}
              >
                {card.vibe ? <VibeChip vibe={card.vibe} /> : card.value}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</span>
            </div>
          ))}
        </div>

        {/* Vibe history */}
        {vibe5Days.length > 0 && (
          <div className="px-4 mb-5">
            <h2 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
              vibe history
            </h2>
            <div className="flex gap-2 flex-wrap">
              {vibe5Days.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium vibe-${s.vibe}`}
                    style={{ backgroundColor: 'var(--bg-surface)' }}
                  >
                    {s.vibe}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                    {new Date(s.date).toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top reactions */}
        <div className="px-4 mb-5">
          <h2 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
            top reactions
          </h2>
          <div className="flex flex-col gap-2.5">
            {reactionTotals.map((item, i) => (
              <div key={item.reaction} className="flex items-center gap-3">
                <span className="w-4 text-xs text-right" style={{ color: 'var(--text-muted)' }}>
                  {i + 1}.
                </span>
                <span className="text-base w-6">{REACTION_EMOJIS[item.reaction]}</span>
                <div className="flex-1 h-2 rounded-full poll-bar-bg overflow-hidden">
                  <div
                    className="h-full rounded-full poll-bar-fill"
                    style={{ width: `${(item.count / maxReaction) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-grotesk w-10 text-right" style={{ color: 'var(--text-secondary)' }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="px-4 pb-8">
          <h2 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
            room badges
          </h2>
          <div className="flex flex-col gap-2">
            {badges.map((b, i) => (
              <Badge key={i} emoji={b.emoji} label={b.label} earned={b.earned} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

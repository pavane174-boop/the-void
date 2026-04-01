import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRoom } from '../hooks/useRoom'
import { useMessages } from '../hooks/useMessages'
import { ThemeToggle } from '../components/ThemeToggle'
import { REACTION_EMOJIS, REACTION_KEYS } from '../lib/types'
import { timeAgo } from '../lib/utils'

export function WallOfFame() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { room, loading } = useRoom(code)
  const { messages } = useMessages(room)

  const fameMessages = [...messages]
    .filter(m => m.total_reactions >= 5)
    .sort((a, b) => b.total_reactions - a.total_reactions)

  if (loading) {
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
            wall of fame
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{room?.name}</p>
        </div>
        <ThemeToggle />
      </div>

      <motion.div
        className="flex-1 overflow-y-auto scroll-ios pt-3 pb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {fameMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-6">
            <span className="text-3xl">🏆</span>
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              no legends yet — messages need 5+ reactions to appear here
            </p>
          </div>
        )}

        {fameMessages.map((msg, i) => {
          const isFirst = i === 0

          return (
            <motion.div
              key={msg.id}
              className={`mx-3 mb-3 rounded-bubble p-4 ${isFirst ? 'fame-card' : ''}`}
              style={
                !isFirst
                  ? { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }
                  : {}
              }
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Rank + label */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-grotesk font-bold text-lg">
                    {isFirst ? '👑' : `#${i + 1}`}
                  </span>
                  {isFirst && (
                    <span className="text-xs font-semibold" style={{ color: 'var(--fame-label)' }}>
                      🏆 #1 LEGEND
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(msg.created_at)}
                </span>
              </div>

              {/* Content */}
              <p
                className="text-sm leading-relaxed mb-3"
                style={{ color: isFirst ? 'var(--fame-label)' : 'var(--text-primary)' }}
              >
                {msg.content}
              </p>

              {/* Reactions breakdown */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3 flex-wrap">
                  {REACTION_KEYS.map(r => {
                    const count = msg[`reaction_${r}` as keyof typeof msg] as number
                    if (!count) return null
                    return (
                      <span key={r} className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        {REACTION_EMOJIS[r]} {count}
                      </span>
                    )
                  })}
                </div>
                <span
                  className="font-grotesk font-bold text-sm"
                  style={{ color: isFirst ? 'var(--fame-label)' : 'var(--accent)' }}
                >
                  {msg.total_reactions} total
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

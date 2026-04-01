import type { Message } from '../lib/types'
import { timeAgo } from '../lib/utils'
import { REACTION_EMOJIS, REACTION_KEYS } from '../lib/types'

interface ConfessionBubbleProps {
  message: Message
  onClick: () => void
}

export function ConfessionBubble({ message, onClick }: ConfessionBubbleProps) {
  const reactions = REACTION_KEYS.filter(r => {
    const key = `reaction_${r}` as keyof Message
    return (message[key] as number) > 0
  })

  const isFame = message.total_reactions >= 20

  return (
    <div
      className={`message-enter confession-card rounded-bubble p-3 mx-3 mb-2 cursor-pointer ${isFame ? 'fame-card' : ''}`}
      style={isFame ? {} : undefined}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--confession-label)' }}>
          🎭 CONFESSION
        </span>
        {isFame && (
          <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--fame-label)' }}>
            🏆 WALL OF FAME
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--confession-text)' }}>
        {message.content}
      </p>

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex gap-2 flex-wrap">
          {reactions.map(r => {
            const count = message[`reaction_${r}` as keyof Message] as number
            return (
              <span key={r} className="text-xs" style={{ color: 'var(--confession-text)' }}>
                {REACTION_EMOJIS[r]}{count}
              </span>
            )
          })}
        </div>
        <span className="text-xs" style={{ color: 'var(--confession-label)', opacity: 0.6 }}>
          {timeAgo(message.created_at)}
        </span>
      </div>
    </div>
  )
}

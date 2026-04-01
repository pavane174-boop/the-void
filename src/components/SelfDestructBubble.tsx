import { useEffect, useState } from 'react'
import type { Message } from '../lib/types'
import { formatCountdown, timeAgo } from '../lib/utils'
import { REACTION_EMOJIS, REACTION_KEYS } from '../lib/types'

interface SelfDestructBubbleProps {
  message: Message
  onClick: () => void
}

export function SelfDestructBubble({ message, onClick }: SelfDestructBubbleProps) {
  const [countdown, setCountdown] = useState(() =>
    message.self_destruct_at ? formatCountdown(message.self_destruct_at) : ''
  )

  const isExpired = message.self_destruct_at
    ? new Date(message.self_destruct_at).getTime() <= Date.now()
    : false

  useEffect(() => {
    if (!message.self_destruct_at) return
    const iv = setInterval(() => {
      setCountdown(formatCountdown(message.self_destruct_at!))
    }, 1000)
    return () => clearInterval(iv)
  }, [message.self_destruct_at])

  const reactions = REACTION_KEYS.filter(r => {
    const key = `reaction_${r}` as keyof Message
    return (message[key] as number) > 0
  })

  return (
    <div
      className="message-enter rounded-bubble p-3 mx-3 mb-2 cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        opacity: isExpired ? 0.4 : 0.75,
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--streak)' }}>
          💣 {countdown || 'expired'}
        </span>
      </div>

      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {message.content}
      </p>

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-1 flex-wrap">
          {reactions.map(r => {
            const count = message[`reaction_${r}` as keyof Message] as number
            return (
              <span key={r} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {REACTION_EMOJIS[r]}{count}
              </span>
            )
          })}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(message.created_at)}
        </span>
      </div>
    </div>
  )
}

import type { Message } from '../lib/types'
import { timeAgo, truncate } from '../lib/utils'
import { REACTION_EMOJIS, REACTION_KEYS } from '../lib/types'

interface ReplyBubbleProps {
  message: Message
  onClick: () => void
}

export function ReplyBubble({ message, onClick }: ReplyBubbleProps) {
  const reactions = REACTION_KEYS.filter(r => {
    const key = `reaction_${r}` as keyof Message
    return (message[key] as number) > 0
  })

  return (
    <div
      className="message-enter rounded-bubble overflow-hidden mx-3 mb-2 cursor-pointer"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      onClick={onClick}
    >
      {/* Reply preview */}
      <div
        className="px-3 py-1.5 flex items-center gap-2"
        style={{ backgroundColor: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="w-0.5 h-full self-stretch rounded-full" style={{ backgroundColor: 'var(--accent)', minHeight: 16 }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          ↩ {truncate(message.reply_preview ?? '', 60)}
        </span>
      </div>

      {/* Main content */}
      <div className="p-3">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {message.content}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2 flex-wrap">
            {reactions.map(r => {
              const count = message[`reaction_${r}` as keyof Message] as number
              return (
                <span key={r} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
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
    </div>
  )
}

import type { Message } from '../lib/types'
import { timeAgo } from '../lib/utils'

interface PinnedBubbleProps {
  message: Message
  onClick: () => void
}

export function PinnedBubble({ message, onClick }: PinnedBubbleProps) {
  return (
    <div
      className="message-enter rounded-bubble p-3 mx-3 mb-2 cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--accent)',
        borderLeft: '3px solid var(--accent)',
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
          📌 PINNED
        </span>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
        {message.content}
      </p>
      <div className="flex justify-end mt-1.5">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(message.created_at)}
        </span>
      </div>
    </div>
  )
}

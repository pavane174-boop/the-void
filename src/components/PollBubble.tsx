import type { Message } from '../lib/types'
import { timeAgo } from '../lib/utils'

interface PollBubbleProps {
  message: Message
  onVote: (optionIndex: number) => void
  sessionId: string
  onClick: () => void
}

export function PollBubble({ message, onVote, sessionId, onClick }: PollBubbleProps) {
  const options = message.poll_options ?? []
  const votes = message.poll_votes ?? {}
  const myVote = votes[sessionId]
  const hasVoted = myVote !== undefined

  const voteCounts = options.map((_, i) =>
    Object.values(votes).filter(v => v === String(i)).length
  )
  const totalVotes = voteCounts.reduce((a, b) => a + b, 0)

  return (
    <div
      className="message-enter rounded-bubble p-3 mx-3 mb-2 cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>📊 POLL</span>
      </div>

      <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
        {message.content}
      </p>

      <div className="flex flex-col gap-2">
        {options.map((option, i) => {
          const count = voteCounts[i]
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          const isMyVote = myVote === String(i)

          return (
            <button
              key={i}
              className="w-full text-left rounded-lg overflow-hidden"
              style={{ border: `1px solid ${isMyVote ? 'var(--accent)' : 'var(--border)'}` }}
              onClick={e => {
                e.stopPropagation()
                if (!hasVoted) onVote(i)
              }}
              disabled={hasVoted}
            >
              <div className="relative h-8">
                {/* Fill bar */}
                <div
                  className="poll-bar-fill absolute inset-y-0 left-0"
                  style={{ width: hasVoted ? `${pct}%` : '0%', transition: 'width 400ms ease' }}
                />
                {/* Label */}
                <div className="relative flex items-center justify-between px-2 h-full">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {option}
                  </span>
                  {hasVoted && (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {pct}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(message.created_at)}
        </span>
      </div>
    </div>
  )
}

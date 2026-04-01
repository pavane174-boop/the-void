import type { Message, ReactionType } from '../lib/types'
import { REACTION_EMOJIS, REACTION_KEYS } from '../lib/types'
import { timeAgo } from '../lib/utils'
import { ConfessionBubble } from './ConfessionBubble'
import { PollBubble } from './PollBubble'
import { TickingBombBubble } from './TickingBombBubble'
import { SelfDestructBubble } from './SelfDestructBubble'
import { PinnedBubble } from './PinnedBubble'
import { ReplyBubble } from './ReplyBubble'

interface MessageBubbleProps {
  message: Message
  onTap: (msg: Message) => void
  onVote: (msg: Message, optionIndex: number) => void
  onAnswerBomb: (msg: Message, answer: string) => void
  onPin: (msg: Message) => void
  sessionId: string
}

export function MessageBubble({
  message,
  onTap,
  onVote,
  onAnswerBomb,
  onPin: _onPin,
  sessionId,
}: MessageBubbleProps) {
  const { message_type } = message

  if (message_type === 'confession') {
    return <ConfessionBubble message={message} onClick={() => onTap(message)} />
  }

  if (message_type === 'poll') {
    return (
      <PollBubble
        message={message}
        onVote={i => onVote(message, i)}
        sessionId={sessionId}
        onClick={() => onTap(message)}
      />
    )
  }

  if (message_type === 'ticking_bomb') {
    return (
      <TickingBombBubble
        message={message}
        onAnswer={a => onAnswerBomb(message, a)}
        sessionId={sessionId}
        onClick={() => onTap(message)}
      />
    )
  }

  if (message_type === 'self_destruct' || message.self_destruct_at) {
    return <SelfDestructBubble message={message} onClick={() => onTap(message)} />
  }

  if (message.is_pinned) {
    return <PinnedBubble message={message} onClick={() => onTap(message)} />
  }

  if (message.reply_to_id) {
    return <ReplyBubble message={message} onClick={() => onTap(message)} />
  }

  // Regular message
  const reactions = REACTION_KEYS.filter(r => {
    const key = `reaction_${r}` as keyof Message
    return (message[key] as number) > 0
  })

  const isFame = message.total_reactions >= 20

  return (
    <div
      className={`message-enter rounded-bubble p-3 mx-3 mb-2 cursor-pointer ${isFame ? 'fame-card' : ''}`}
      style={
        isFame
          ? {}
          : { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }
      }
      onClick={() => onTap(message)}
    >
      {isFame && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--fame-label)' }}>
            🏆 WALL OF FAME
          </span>
        </div>
      )}

      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {message.content}
      </p>

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2 flex-wrap">
          {reactions.map(r => {
            const count = message[`reaction_${r}` as keyof Message] as number
            const myReactions = message.reacted_sessions?.[sessionId] ?? []
            const active = myReactions.includes(r)
            return (
              <span
                key={r}
                className="text-xs"
                style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}
              >
                {REACTION_EMOJIS[r as ReactionType]}{count}
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

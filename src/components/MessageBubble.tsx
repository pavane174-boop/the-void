import { useRef } from 'react'
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
  onLongPress: (msg: Message) => void
  onVote: (msg: Message, optionIndex: number) => void
  onAnswerBomb: (msg: Message, answer: string) => void
  onPin: (msg: Message) => void
  sessionId: string
}

export function MessageBubble({
  message,
  onLongPress,
  onVote,
  onAnswerBomb,
  onPin: _onPin,
  sessionId,
}: MessageBubbleProps) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const startPress = () => {
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onLongPress(message)
    }, 500)
  }

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const longPressProps = {
    onTouchStart: startPress,
    onTouchEnd: cancelPress,
    onTouchMove: cancelPress,
    onMouseDown: startPress,
    onMouseUp: cancelPress,
    onMouseLeave: cancelPress,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      onLongPress(message)
    },
    style: { userSelect: 'none' as const },
  }

  const { message_type } = message

  if (message_type === 'confession') {
    return (
      <div {...longPressProps}>
        <ConfessionBubble message={message} onClick={() => {}} />
      </div>
    )
  }

  if (message_type === 'poll') {
    return (
      <div {...longPressProps}>
        <PollBubble
          message={message}
          onVote={i => onVote(message, i)}
          sessionId={sessionId}
          onClick={() => {}}
        />
      </div>
    )
  }

  if (message_type === 'ticking_bomb') {
    return (
      <div {...longPressProps}>
        <TickingBombBubble
          message={message}
          onAnswer={a => onAnswerBomb(message, a)}
          sessionId={sessionId}
          onClick={() => {}}
        />
      </div>
    )
  }

  if (message_type === 'self_destruct' || message.self_destruct_at) {
    return (
      <div {...longPressProps}>
        <SelfDestructBubble message={message} onClick={() => {}} />
      </div>
    )
  }

  if (message.is_pinned) {
    return (
      <div {...longPressProps}>
        <PinnedBubble message={message} onClick={() => {}} />
      </div>
    )
  }

  if (message.reply_to_id) {
    return (
      <div {...longPressProps}>
        <ReplyBubble message={message} onClick={() => {}} />
      </div>
    )
  }

  // Regular message
  const reactions = REACTION_KEYS.filter(r => {
    const key = `reaction_${r}` as keyof Message
    return (message[key] as number) > 0
  })

  const isFame = message.total_reactions >= 20

  return (
    <div
      {...longPressProps}
      className={`message-enter rounded-bubble p-3 mx-3 mb-2 ${isFame ? 'fame-card' : ''}`}
      style={{
        ...(isFame ? {} : { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }),
        userSelect: 'none',
      }}
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

      <div className="flex items-center justify-between mt-2 gap-2">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {reactions.map(r => {
            const count = message[`reaction_${r}` as keyof Message] as number
            const myReactions = message.reacted_sessions?.[sessionId] ?? []
            const active = myReactions.includes(r)
            return (
              <span
                key={r}
                className="reaction-pill"
                style={active ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
              >
                {REACTION_EMOJIS[r as ReactionType]}
                <span style={{ fontSize: 11, fontWeight: 600 }}>{count}</span>
              </span>
            )
          })}
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(message.created_at)}
        </span>
      </div>
    </div>
  )
}

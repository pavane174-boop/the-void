import { useEffect, useState } from 'react'
import type { Message } from '../lib/types'
import { formatCountdown, timeAgo } from '../lib/utils'

interface TickingBombBubbleProps {
  message: Message
  onAnswer: (answer: string) => void
  sessionId: string
  onClick: () => void
}

export function TickingBombBubble({ message, onAnswer, sessionId, onClick }: TickingBombBubbleProps) {
  const [countdown, setCountdown] = useState(() =>
    message.bomb_expires_at ? formatCountdown(message.bomb_expires_at) : ''
  )
  const [answering, setAnswering] = useState(false)
  const [answerText, setAnswerText] = useState('')

  const answers = message.bomb_answers ?? []
  const isExpired = message.bomb_expires_at
    ? new Date(message.bomb_expires_at).getTime() <= Date.now()
    : false
  const hasAnswered = answers.some((a: string) => a.startsWith(`[${sessionId.slice(0,8)}]`))

  useEffect(() => {
    if (!message.bomb_expires_at || isExpired) return
    const iv = setInterval(() => {
      setCountdown(formatCountdown(message.bomb_expires_at!))
    }, 1000)
    return () => clearInterval(iv)
  }, [message.bomb_expires_at, isExpired])

  const submit = () => {
    if (!answerText.trim()) return
    onAnswer(`[${sessionId.slice(0, 8)}] ${answerText.trim()}`)
    setAnswerText('')
    setAnswering(false)
  }

  return (
    <div
      className="message-enter bomb-card rounded-bubble mx-3 mb-2 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            💣 TICKING BOMB
          </span>
          {!isExpired && (
            <span className="text-xs font-grotesk" style={{ color: 'var(--streak)' }}>
              ⏱ {countdown}
            </span>
          )}
          {isExpired && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>expired</span>
          )}
        </div>

        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {message.bomb_prompt || message.content}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {answers.length} answered
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {timeAgo(message.created_at)}
          </span>
        </div>

        {/* Revealed answers (when expired) */}
        {isExpired && answers.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              💬 Answers:
            </div>
            {answers.map((a: string, i: number) => {
              const text = a.replace(/^\[[^\]]+\]\s*/, '')
              return (
                <div
                  key={i}
                  className="text-sm px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {text}
                </div>
              )
            })}
          </div>
        )}

        {/* Answer input */}
        {!isExpired && !hasAnswered && !answering && (
          <button
            className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
            onClick={e => { e.stopPropagation(); setAnswering(true) }}
          >
            answer anonymously
          </button>
        )}

        {!isExpired && answering && (
          <div className="mt-2 flex gap-2" onClick={e => e.stopPropagation()}>
            <input
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="your anonymous answer..."
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: 'var(--accent)', color: '#000' }}
              onClick={submit}
            >
              send
            </button>
          </div>
        )}

        {!isExpired && hasAnswered && (
          <div className="mt-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            ✓ answered — results reveal when time's up
          </div>
        )}
      </div>
    </div>
  )
}

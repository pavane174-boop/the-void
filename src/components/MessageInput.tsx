import { useRef, useState } from 'react'
import type { Message } from '../lib/types'
import { truncate } from '../lib/utils'

interface MessageInputProps {
  onSend: (params: {
    content: string
    type?: Message['message_type']
    selfDestructMinutes?: number
    replyTo?: Message | null
    pollOptions?: string[]
    bombPrompt?: string
    bombHours?: number
  }) => void
  onTyping: () => void
  replyTo: Message | null
  onCancelReply: () => void
  confessionMode: boolean
  onToggleConfession: () => void
  onOpenPoll: () => void
  onOpenBomb: () => void
  selfDestructMinutes: number | null
  onSetSelfDestruct: (minutes: number | null) => void
  features: { confessions: boolean; polls: boolean; ticking_bombs: boolean; self_destruct: boolean }
}

const DESTRUCT_OPTIONS = [
  { label: '1m', value: 1 },
  { label: '5m', value: 5 },
  { label: '15m', value: 15 },
]

export function MessageInput({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  confessionMode,
  onToggleConfession,
  onOpenPoll,
  onOpenBomb: _onOpenBomb,
  selfDestructMinutes,
  onSetSelfDestruct,
  features,
}: MessageInputProps) {
  const [text, setText] = useState('')
  const [showDestructPicker, setShowDestructPicker] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!text.trim()) return
    onSend({
      content: text.trim(),
      type: confessionMode ? 'confession' : selfDestructMinutes ? 'self_destruct' : 'regular',
      selfDestructMinutes: selfDestructMinutes ?? undefined,
      replyTo,
    })
    setText('')
    onCancelReply()
    inputRef.current?.focus()
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    onTyping()
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const borderColor = confessionMode
    ? 'var(--confession-border)'
    : selfDestructMinutes
    ? 'var(--streak)'
    : 'var(--border)'

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
      }}
    >
      {/* Reply preview */}
      {replyTo && (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ backgroundColor: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="text-xs flex-1" style={{ color: 'var(--text-muted)' }}>
            ↩ {truncate(replyTo.content, 60)}
          </span>
          <button
            onClick={onCancelReply}
            className="text-xs w-5 h-5 flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Self-destruct timer picker */}
      {showDestructPicker && features.self_destruct && (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>💣 self-destruct:</span>
          {DESTRUCT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                onSetSelfDestruct(selfDestructMinutes === opt.value ? null : opt.value)
                setShowDestructPicker(false)
              }}
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: selfDestructMinutes === opt.value ? 'var(--streak)' : 'var(--bg-surface)',
                color: selfDestructMinutes === opt.value ? '#000' : 'var(--text-secondary)',
                border: `1px solid ${selfDestructMinutes === opt.value ? 'var(--streak)' : 'var(--border)'}`,
              }}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => { onSetSelfDestruct(null); setShowDestructPicker(false) }}
            className="text-xs ml-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            cancel
          </button>
        </div>
      )}

      {/* Confession / self-destruct mode badge */}
      {(confessionMode || selfDestructMinutes) && (
        <div className="flex items-center gap-2 px-4 py-1.5">
          {confessionMode && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--confession-border)', color: 'var(--confession-label)' }}>
              🎭 confession mode
            </span>
          )}
          {selfDestructMinutes && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,145,0,0.15)', color: 'var(--streak)' }}>
              💣 {selfDestructMinutes}m
            </span>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2">
        {/* Left action buttons */}
        <div className="flex items-center gap-1 mb-1">
          {features.confessions && (
            <button
              onClick={onToggleConfession}
              className="w-8 h-8 flex items-center justify-center rounded-full text-base"
              style={{
                backgroundColor: confessionMode ? 'var(--confession-border)' : 'transparent',
                color: confessionMode ? 'var(--confession-label)' : 'var(--text-muted)',
              }}
              title="Confession mode"
            >
              🎭
            </button>
          )}
          {features.polls && (
            <button
              onClick={onOpenPoll}
              className="w-8 h-8 flex items-center justify-center rounded-full text-base"
              style={{ color: 'var(--text-muted)' }}
              title="Create poll"
            >
              📊
            </button>
          )}
          {features.self_destruct && (
            <button
              onClick={() => setShowDestructPicker(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-base"
              style={{
                color: selfDestructMinutes ? 'var(--streak)' : 'var(--text-muted)',
              }}
              title="Self-destruct timer"
            >
              💣
            </button>
          )}
        </div>

        {/* Text input */}
        <div
          className="flex-1 flex items-end rounded-pill overflow-hidden"
          style={{ border: `1.5px solid ${borderColor}`, backgroundColor: 'var(--bg-surface)', transition: 'border-color 200ms ease' }}
        >
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="say something..."
            rows={1}
            className="flex-1 px-4 py-2.5 text-sm outline-none resize-none bg-transparent"
            style={{
              color: 'var(--text-primary)',
              maxHeight: 100,
              lineHeight: '1.4',
              scrollbarWidth: 'none',
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 mb-0.5 transition-opacity"
          style={{
            backgroundColor: text.trim() ? 'var(--accent)' : 'var(--bg-surface)',
            color: text.trim() ? '#000' : 'var(--text-muted)',
            border: text.trim() ? 'none' : '1px solid var(--border)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

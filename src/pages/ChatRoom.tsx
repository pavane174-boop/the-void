import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useRoom } from '../hooks/useRoom'
import { useMessages } from '../hooks/useMessages'
import { usePresence } from '../hooks/usePresence'
import { useStats } from '../hooks/useStats'
import { calculateVibe } from '../lib/vibe'
import { copyToClipboard } from '../lib/utils'
import type { Message, ReactionType, VibeType } from '../lib/types'
import { ThemeToggle } from '../components/ThemeToggle'
import { GhostDots } from '../components/GhostDots'
import { StatsBar } from '../components/StatsBar'
import { MessageBubble } from '../components/MessageBubble'
import { MessageInput } from '../components/MessageInput'
import { MessageContextMenu } from '../components/MessageContextMenu'
import { RareReactionToast } from '../components/RareReactionToast'
import { TypingIndicator } from '../components/TypingIndicator'
import { PollCreator } from '../components/PollCreator'
import { BombCreator } from '../components/BombCreator'
import { Modal } from '../components/Modal'

export function ChatRoom() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const { room, loading: roomLoading, error: roomError } = useRoom(code)
  const {
    messages,
    loading: msgsLoading,
    sendMessage,
    reactToMessage,
    votePoll,
    answerBomb,
    pinMessage,
    sessionId,
  } = useMessages(room)
  const { onlineCount, isTyping, broadcastTyping } = usePresence(code)
  const { todayStats } = useStats(room?.id)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [confessionMode, setConfessionMode] = useState(false)
  const [selfDestructMinutes, setSelfDestructMinutes] = useState<number | null>(null)
  const [contextMessage, setContextMessage] = useState<Message | null>(null)
  const [rareToast, setRareToast] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [showBombCreator, setShowBombCreator] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const typingDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Calculate vibe from messages
  const vibe: VibeType = messages.length > 0 ? calculateVibe(messages) : 'chill'

  const handleLongPress = useCallback((msg: Message) => {
    setContextMessage(msg)
  }, [])

  const handleCopyMessage = useCallback((msg: Message) => {
    navigator.clipboard.writeText(msg.content).catch(() => {
      const el = document.createElement('textarea')
      el.value = msg.content
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
  }, [])

  const handleReact = useCallback(
    (msg: Message, reaction: ReactionType) => {
      if (Math.random() < 0.1) setRareToast(true)
      reactToMessage(msg, reaction)
    },
    [reactToMessage]
  )

  const handleSend = useCallback(
    (params: Parameters<typeof sendMessage>[0]) => {
      sendMessage(params)
      setConfessionMode(false)
      setSelfDestructMinutes(null)
    },
    [sendMessage]
  )

  const handleTyping = useCallback(() => {
    if (typingDebounce.current) clearTimeout(typingDebounce.current)
    broadcastTyping()
    typingDebounce.current = setTimeout(() => {}, 3000)
  }, [broadcastTyping])

  const handleCopyCode = async () => {
    await copyToClipboard(code ?? '')
    setCodeCopied(true)
    setShowMenu(false)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  if (roomLoading || msgsLoading) {
    return (
      <div style={{ height: '100dvh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          className="w-10 h-10 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      </div>
    )
  }

  if (roomError || !room) {
    return (
      <div style={{ height: '100dvh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px' }}>
        <span className="text-4xl">👻</span>
        <p className="font-grotesk font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
          void not found
        </p>
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          this void doesn't exist or has vanished
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-pill font-semibold text-sm mt-2"
          style={{ backgroundColor: 'var(--accent)', color: '#000' }}
        >
          go home
        </button>
      </div>
    )
  }

  const features = room.features ?? {
    confessions: true,
    self_destruct: true,
    polls: true,
    ticking_bombs: true,
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--bg-primary)' }}>
      {/* ── HEADER ── */}
      <div
        className="flex-shrink-0 flex items-center px-4 py-2.5 gap-3"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
      >
        {/* Left: title + code */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-grotesk font-medium text-sm leading-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            the void
          </span>
          <button
            onClick={handleCopyCode}
            className="text-left"
          >
            <span
              className="font-grotesk text-xs tracking-widest uppercase"
              style={{ color: codeCopied ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: 4 }}
            >
              #{codeCopied ? 'copied!' : code}
            </span>
          </button>
        </div>

        {/* Ghost dots + online */}
        <div className="flex items-center gap-2">
          <GhostDots count={Math.max(1, onlineCount)} />
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <span className="text-xs" style={{ color: 'var(--accent)' }}>live</span>
          </div>
        </div>

        {/* Menu + theme */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowMenu(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="flex-shrink-0">
        <StatsBar
          room={room}
          vibe={vibe}
          todayCount={todayStats?.message_count ?? 0}
          onlineCount={onlineCount}
        />
      </div>

      {/* ── TYPING INDICATOR ── */}
      <TypingIndicator visible={isTyping} />

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto scroll-ios pt-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6" style={{ paddingTop: '30dvh' }}>
            <span className="text-3xl">👻</span>
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              no messages yet — break the silence
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <MessageBubble
                message={msg}
                onLongPress={handleLongPress}
                onVote={(m, i) => votePoll(m, i)}
                onAnswerBomb={(m, a) => answerBomb(m, a)}
                onPin={pinMessage}
                sessionId={sessionId}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* ── INPUT BAR ── */}
      <div className="flex-shrink-0">
        <MessageInput
          onSend={handleSend}
          onTyping={handleTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          confessionMode={confessionMode}
          onToggleConfession={() => setConfessionMode(v => !v)}
          onOpenPoll={() => setShowPollCreator(true)}
          onOpenBomb={() => setShowBombCreator(true)}
          selfDestructMinutes={selfDestructMinutes}
          onSetSelfDestruct={setSelfDestructMinutes}
          features={features}
        />
      </div>

      {/* ── MESSAGE CONTEXT MENU ── */}
      <MessageContextMenu
        message={contextMessage}
        onReact={handleReact}
        onCopy={handleCopyMessage}
        onReply={(msg) => { setReplyTo(msg); setContextMessage(null) }}
        onClose={() => setContextMessage(null)}
        sessionId={sessionId}
      />

      {/* ── RARE REACTION TOAST ── */}
      <RareReactionToast visible={rareToast} onDismiss={() => setRareToast(false)} />

      {/* ── POLL CREATOR ── */}
      <PollCreator
        open={showPollCreator}
        onClose={() => setShowPollCreator(false)}
        onCreate={(question, options) => {
          sendMessage({ content: question, type: 'poll', pollOptions: options })
        }}
      />

      {/* ── BOMB CREATOR ── */}
      <BombCreator
        open={showBombCreator}
        onClose={() => setShowBombCreator(false)}
        onCreate={(prompt, hours) => {
          sendMessage({ content: prompt, type: 'ticking_bomb', bombPrompt: prompt, bombHours: hours })
        }}
      />

      {/* ── MENU MODAL ── */}
      <Modal open={showMenu} onClose={() => setShowMenu(false)}>
        <div className="p-4 flex flex-col gap-1">
          {[
            { label: '📊 room stats', action: () => navigate(`/room/${code}/stats`) },
            { label: '🏆 wall of fame', action: () => navigate(`/room/${code}/wall-of-fame`) },
            { label: codeCopied ? '✓ code copied!' : '📋 copy room code', action: handleCopyCode },
            { label: '💣 drop a bomb', action: () => { setShowMenu(false); setShowBombCreator(true) }, show: features.ticking_bombs },
            { label: '↩ reply to message', action: () => setShowMenu(false) },
            { label: '🚪 leave void', action: () => navigate('/'), danger: true },
          ]
            .filter(item => item.show !== false)
            .map((item, i) => (
              <button
                key={i}
                onClick={() => { item.action(); setShowMenu(false) }}
                className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium"
                style={{
                  color: item.danger ? '#ff5252' : 'var(--text-primary)',
                  backgroundColor: 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
        </div>
      </Modal>
    </div>
  )
}

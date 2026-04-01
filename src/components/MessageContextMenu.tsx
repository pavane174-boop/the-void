import { motion, AnimatePresence } from 'framer-motion'
import type { Message, ReactionType } from '../lib/types'
import { REACTION_EMOJIS, REACTION_KEYS } from '../lib/types'

interface MessageContextMenuProps {
  message: Message | null
  onReact: (msg: Message, reaction: ReactionType) => void
  onCopy: (msg: Message) => void
  onReply: (msg: Message) => void
  onClose: () => void
  sessionId: string
}

export function MessageContextMenu({
  message,
  onReact,
  onCopy,
  onReply,
  onClose,
  sessionId,
}: MessageContextMenuProps) {
  return (
    <AnimatePresence>
      {message && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            className="fixed bottom-0 z-50 w-full"
            style={{ maxWidth: 480, left: '50%', transform: 'translateX(-50%)' }}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          >
            {/* Reaction bar */}
            <div
              className="mx-3 mb-2 px-2 py-3 rounded-2xl flex items-center justify-around"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
              }}
            >
              {REACTION_KEYS.map((reaction, i) => {
                const myReactions = message.reacted_sessions?.[sessionId] ?? []
                const active = myReactions.includes(reaction)
                const count = (message[`reaction_${reaction}` as keyof Message] as number) ?? 0
                return (
                  <motion.button
                    key={reaction}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.045, type: 'spring', stiffness: 500, damping: 18 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => {
                      onReact(message, reaction)
                      onClose()
                    }}
                    className="flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl"
                    style={{
                      backgroundColor: active ? 'rgba(0,230,118,0.12)' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: 30, lineHeight: 1 }}>{REACTION_EMOJIS[reaction]}</span>
                    <span
                      className="font-medium"
                      style={{
                        fontSize: 11,
                        color: active ? 'var(--accent)' : count > 0 ? 'var(--text-secondary)' : 'transparent',
                      }}
                    >
                      {count > 0 ? count : '·'}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Action list */}
            <div
              className="mx-3 mb-8 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              {[
                { icon: '📋', label: 'Copy message', action: () => { onCopy(message); onClose() } },
                { icon: '↩️', label: 'Reply',         action: () => { onReply(message); onClose() } },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium active:opacity-60"
                  style={{
                    color: 'var(--text-primary)',
                    borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'transparent',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

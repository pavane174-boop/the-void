import { motion, AnimatePresence } from 'framer-motion'
import type { Message, ReactionType } from '../lib/types'
import { REACTION_EMOJIS, REACTION_KEYS } from '../lib/types'

interface ReactionPickerProps {
  message: Message | null
  onReact: (msg: Message, reaction: ReactionType) => void
  onClose: () => void
  showRare: boolean
  sessionId: string
}

export function ReactionPicker({ message, onReact, onClose, showRare, sessionId }: ReactionPickerProps) {
  const visibleReactions = showRare
    ? REACTION_KEYS
    : REACTION_KEYS.filter(r => r !== 'diamond')

  return (
    <AnimatePresence>
      {message && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-3 py-2 rounded-full"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          >
            {visibleReactions.map((reaction, i) => {
              const myReactions = message.reacted_sessions?.[sessionId] ?? []
              const active = myReactions.includes(reaction)
              return (
                <motion.button
                  key={reaction}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => {
                    onReact(message, reaction)
                    onClose()
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-lg transition-transform"
                  style={{
                    backgroundColor: active ? 'var(--bg-surface-hover)' : 'transparent',
                    transform: active ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {REACTION_EMOJIS[reaction]}
                  {reaction === 'diamond' && (
                    <span className="absolute -top-1 -right-1 text-xs" style={{ color: 'var(--rare)', fontSize: 8 }}>✨</span>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

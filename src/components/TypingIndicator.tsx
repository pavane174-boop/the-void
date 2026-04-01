import { motion, AnimatePresence } from 'framer-motion'

interface TypingIndicatorProps {
  visible: boolean
}

export function TypingIndicator({ visible }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-1"
        >
          <span className="italic text-xs" style={{ color: 'var(--text-muted)' }}>
            a ghost is typing...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

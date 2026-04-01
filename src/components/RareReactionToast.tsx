import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RareReactionToastProps {
  visible: boolean
  onDismiss: () => void
}

export function RareReactionToast({ visible, onDismiss }: RareReactionToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDismiss, 3000)
      return () => clearTimeout(t)
    }
  }, [visible, onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm flex items-center gap-2 toast-enter"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--rare)',
            color: 'var(--rare)',
            boxShadow: '0 4px 20px rgba(255,170,0,0.2)',
            whiteSpace: 'nowrap',
          }}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ duration: 0.25 }}
        >
          ✨ rare reaction unlocked: 💎 diamond
        </motion.div>
      )}
    </AnimatePresence>
  )
}

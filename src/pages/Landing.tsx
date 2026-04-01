import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Theme toggle top-right */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      {/* Center content */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 pb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Orb */}
        <motion.div
          className="w-14 h-14 rounded-full orb-glow mb-8"
          style={{ backgroundColor: 'var(--accent)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Title */}
        <h1
          className="font-grotesk text-4xl font-medium mb-3 tracking-tight"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}
        >
          the void
        </h1>

        <p className="text-sm text-center mb-1" style={{ color: 'var(--text-secondary)' }}>
          speak without a face.
        </p>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--text-secondary)' }}>
          listen without judgment.
        </p>

        {/* Buttons */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={() => navigate('/create')}
            className="w-full py-3.5 rounded-pill font-semibold text-sm"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          >
            create a void
          </button>
          <button
            onClick={() => navigate('/join')}
            className="w-full py-3.5 rounded-pill font-semibold text-sm"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border)',
            }}
          >
            join a void
          </button>
        </div>

        {/* Tagline */}
        <p className="text-xs text-center mt-10" style={{ color: 'var(--text-muted)' }}>
          no accounts. no identity. no trace.
        </p>
      </motion.div>
    </div>
  )
}

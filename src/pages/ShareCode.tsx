import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { copyToClipboard } from '../lib/utils'
import { ThemeToggle } from '../components/ThemeToggle'

export function ShareCode() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyCode = async () => {
    await copyToClipboard(code ?? '')
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyLink = async () => {
    await copyToClipboard(`${window.location.origin}/join/${code}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex justify-end px-4 py-3">
        <ThemeToggle />
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 pb-12"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Success icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6 orb-glow"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="font-grotesk font-semibold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
          void created
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          share this code with your ghosts
        </p>

        {/* Room code */}
        <div
          className="font-grotesk font-semibold text-4xl mb-8 tracking-widest"
          style={{ color: 'var(--accent)', letterSpacing: '10px' }}
        >
          {code}
        </div>

        {/* Buttons */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={handleCopyCode}
            className="w-full py-3.5 rounded-pill font-semibold text-sm"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          >
            {copiedCode ? '✓ copied!' : 'copy code'}
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full py-3.5 rounded-pill font-semibold text-sm"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border)',
            }}
          >
            {copiedLink ? '✓ link copied!' : 'share link'}
          </button>
        </div>

        <button
          onClick={() => navigate(`/room/${code}`)}
          className="mt-8 text-sm font-semibold"
          style={{ color: 'var(--accent)' }}
        >
          enter the void →
        </button>

        {/* Waiting dots animation */}
        <div className="mt-10 flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--text-muted)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
            waiting for ghosts...
          </span>
        </div>
      </motion.div>
    </div>
  )
}

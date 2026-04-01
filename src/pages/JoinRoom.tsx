import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ThemeToggle } from '../components/ThemeToggle'

export function JoinRoom() {
  const navigate = useNavigate()
  const { code: prefilledCode } = useParams<{ code?: string }>()
  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (prefilledCode && prefilledCode.length === 4) {
      const chars = prefilledCode.toUpperCase().split('')
      setDigits(chars)
      setTimeout(() => attemptJoin(chars.join('')), 100)
    } else {
      inputRefs.current[0]?.focus()
    }
  }, [prefilledCode])

  const attemptJoin = async (code: string) => {
    if (code.length !== 4) return
    setLoading(true)
    setError(false)

    const { data } = await supabase
      .from('rooms')
      .select('code')
      .eq('code', code.toUpperCase())
      .single()

    if (!data) {
      setError(true)
      setLoading(false)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setDigits(['', '', '', ''])
      inputRefs.current[0]?.focus()
      return
    }

    navigate(`/room/${data.code}`)
  }

  const handleInput = (i: number, val: string) => {
    const char = val.replace(/[^A-Za-z0-9]/g, '').slice(-1).toUpperCase()
    const next = [...digits]
    next[i] = char
    setDigits(next)
    setError(false)

    if (char && i < 3) {
      inputRefs.current[i + 1]?.focus()
    }

    if (char && i === 3) {
      const code = [...next.slice(0, 3), char].join('')
      if (code.length === 4) attemptJoin(code)
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]
        next[i] = ''
        setDigits(next)
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus()
        const next = [...digits]
        next[i - 1] = ''
        setDigits(next)
      }
    }
  }

  const handleSubmit = () => {
    const code = digits.join('')
    if (code.length === 4) attemptJoin(code)
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="font-grotesk font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          join a void
        </h1>
        <ThemeToggle />
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 pb-12"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-sm mb-2 text-center" style={{ color: 'var(--text-secondary)' }}>
          enter the 4-character code
        </p>
        <p className="text-xs mb-8 text-center" style={{ color: 'var(--text-muted)' }}>
          you'll enter as a ghost — no one will know who you are
        </p>

        {/* PIN boxes */}
        <div className={`flex gap-3 mb-6 ${shake ? 'shake' : ''}`}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              className={`pin-box ${error ? 'error' : ''}`}
              value={digit}
              maxLength={1}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onFocus={e => e.target.select()}
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm mb-4"
            style={{ color: '#ff5252' }}
          >
            void not found — check the code
          </motion.p>
        )}

        <button
          onClick={handleSubmit}
          disabled={digits.join('').length !== 4 || loading}
          className="w-full max-w-xs py-3.5 rounded-pill font-semibold text-sm"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000',
            opacity: digits.join('').length !== 4 || loading ? 0.5 : 1,
          }}
        >
          {loading ? 'entering...' : 'enter the void'}
        </button>
      </motion.div>
    </div>
  )
}

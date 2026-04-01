import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { generateRoomCode } from '../lib/utils'
import { ThemeToggle } from '../components/ThemeToggle'

const MAX_OPTIONS = [5, 10, 20, 50]

export function CreateRoom() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [maxMembers, setMaxMembers] = useState(10)
  const [features, setFeatures] = useState({
    confessions: true,
    self_destruct: true,
    ticking_bombs: true,
    polls: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCreate = async () => {
    if (!name.trim()) { setError('give your void a name'); return }
    setLoading(true)
    setError(null)

    // Try to generate a unique code
    let code = generateRoomCode()
    let attempts = 0
    while (attempts < 10) {
      const { data } = await supabase.from('rooms').select('id').eq('code', code).single()
      if (!data) break
      code = generateRoomCode()
      attempts++
    }

    const { error: err } = await supabase.from('rooms').insert({
      code,
      name: name.trim(),
      max_members: maxMembers,
      features,
    })

    if (err) {
      setError('failed to create void. try again.')
      setLoading(false)
      return
    }

    navigate(`/room/${code}/share`)
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
          create a void
        </h1>
        <ThemeToggle />
      </div>

      <motion.div
        className="flex-1 overflow-y-auto scroll-ios px-4 py-6 flex flex-col gap-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
            void name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. the squad"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            maxLength={50}
          />
        </div>

        {/* Max members */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
            max ghosts
          </label>
          <div className="grid grid-cols-4 gap-2">
            {MAX_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => setMaxMembers(n)}
                className="py-3 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: maxMembers === n ? 'transparent' : 'var(--bg-surface)',
                  color: maxMembers === n ? 'var(--accent)' : 'var(--text-secondary)',
                  border: `1.5px solid ${maxMembers === n ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            features
          </label>
          <div className="flex flex-col gap-3">
            {[
              { key: 'self_destruct' as const, label: 'Self-destruct messages', emoji: '💣' },
              { key: 'confessions' as const, label: 'Confessions', emoji: '🎭' },
              { key: 'ticking_bombs' as const, label: 'Ticking bombs', emoji: '⏱️' },
              { key: 'polls' as const, label: 'Polls', emoji: '📊' },
            ].map(({ key, label, emoji }) => (
              <div
                key={key}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span>{emoji}</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={features[key]}
                    onChange={() => toggleFeature(key)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: '#ff5252' }}>{error}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-4 rounded-pill font-semibold text-sm mt-auto"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'summoning...' : 'summon the void'}
        </button>
      </motion.div>
    </div>
  )
}

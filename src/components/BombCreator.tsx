import { useState } from 'react'
import { Modal } from './Modal'

interface BombCreatorProps {
  open: boolean
  onClose: () => void
  onCreate: (prompt: string, hours: number) => void
}

const BOMB_DURATIONS = [
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
]

export function BombCreator({ open, onClose, onCreate }: BombCreatorProps) {
  const [prompt, setPrompt] = useState('')
  const [hours, setHours] = useState(4)

  const handleCreate = () => {
    if (!prompt.trim()) return
    onCreate(prompt.trim(), hours)
    setPrompt('')
    setHours(4)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="drop a bomb 💣">
      <div className="p-5 flex flex-col gap-4">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Everyone answers anonymously. Results are revealed when time's up.
        </p>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            prompt
          </label>
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. what's one thing you'd change about this group?"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
            timer
          </label>
          <div className="flex gap-2">
            {BOMB_DURATIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setHours(d.value)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: hours === d.value ? 'var(--accent)' : 'var(--bg-surface-hover)',
                  color: hours === d.value ? '#000' : 'var(--text-secondary)',
                  border: `1px solid ${hours === d.value ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!prompt.trim()}
          className="w-full py-3 rounded-pill font-semibold text-sm"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000',
            opacity: !prompt.trim() ? 0.5 : 1,
          }}
        >
          💣 drop it
        </button>
      </div>
    </Modal>
  )
}

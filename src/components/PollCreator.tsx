import { useState } from 'react'
import { Modal } from './Modal'

interface PollCreatorProps {
  open: boolean
  onClose: () => void
  onCreate: (question: string, options: string[]) => void
}

export function PollCreator({ open, onClose, onCreate }: PollCreatorProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  const handleCreate = () => {
    const validOptions = options.filter(o => o.trim())
    if (!question.trim() || validOptions.length < 2) return
    onCreate(question.trim(), validOptions)
    setQuestion('')
    setOptions(['', ''])
    onClose()
  }

  const updateOption = (i: number, val: string) => {
    setOptions(prev => prev.map((o, idx) => (idx === i ? val : o)))
  }

  const addOption = () => {
    if (options.length < 4) setOptions(prev => [...prev, ''])
  }

  const removeOption = (i: number) => {
    if (options.length <= 2) return
    setOptions(prev => prev.filter((_, idx) => idx !== i))
  }

  return (
    <Modal open={open} onClose={onClose} title="create poll">
      <div className="p-5 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            question
          </label>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask the void something..."
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            options
          </label>
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-hover)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 4 && (
            <button
              onClick={addOption}
              className="mt-2 text-xs font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              + add option
            </button>
          )}
        </div>

        <button
          onClick={handleCreate}
          disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
          className="w-full py-3 rounded-pill font-semibold text-sm"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000',
            opacity: (!question.trim() || options.filter(o => o.trim()).length < 2) ? 0.5 : 1,
          }}
        >
          create poll
        </button>
      </div>
    </Modal>
  )
}

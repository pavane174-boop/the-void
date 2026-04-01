interface BadgeProps {
  emoji: string
  label: string
  earned?: boolean
}

export function Badge({ emoji, label, earned = true }: BadgeProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        opacity: earned ? 1 : 0.35,
      }}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
    </div>
  )
}

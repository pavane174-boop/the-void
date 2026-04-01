interface GhostDotsProps {
  count: number
}

const OPACITIES = [0.65, 0.45, 0.35, 0.25, 0.2, 0.15]
const DELAYS = [0, 0.4, 0.8, 1.2, 1.6, 2.0]

export function GhostDots({ count }: GhostDotsProps) {
  const dots = Math.min(count, 6)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className="rounded-full ghost-pulse"
          style={{
            width: 6,
            height: 6,
            backgroundColor: 'var(--accent)',
            opacity: OPACITIES[i] ?? 0.2,
            animationDelay: `${DELAYS[i]}s`,
          }}
        />
      ))}
    </div>
  )
}

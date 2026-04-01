import type { VibeType } from '../lib/types'
import { VIBE_LABELS } from '../lib/vibe'

interface VibeChipProps {
  vibe: VibeType
}

export function VibeChip({ vibe }: VibeChipProps) {
  return (
    <span className={`vibe-${vibe} font-medium`} style={{ fontSize: 13 }}>
      {VIBE_LABELS[vibe]}
    </span>
  )
}

import type { Room, VibeType } from '../lib/types'
import { VibeChip } from './VibeChip'

interface StatsBarProps {
  room: Room
  vibe: VibeType
  todayCount: number
  onlineCount: number
}

export function StatsBar({ room, vibe, todayCount, onlineCount }: StatsBarProps) {
  return (
    <div
      className="flex overflow-x-auto gap-2 px-3 py-2 scroll-ios"
      style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-stats)', scrollbarWidth: 'none' }}
    >
      {/* Streak */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-1.5 rounded-card min-w-[72px]"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <span className="font-grotesk font-semibold text-sm" style={{ color: 'var(--streak)' }}>
          {room.streak_count}🔥
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
          streak
        </span>
      </div>

      {/* Vibe */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-1.5 rounded-card min-w-[72px]"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <VibeChip vibe={vibe} />
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
          vibe
        </span>
      </div>

      {/* Today */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-1.5 rounded-card min-w-[72px]"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <span className="font-grotesk font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {todayCount}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
          today
        </span>
      </div>

      {/* Ghosts */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-1.5 rounded-card min-w-[72px]"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <span className="font-grotesk font-semibold text-sm" style={{ color: 'var(--accent)' }}>
          {onlineCount}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
          ghosts
        </span>
      </div>
    </div>
  )
}

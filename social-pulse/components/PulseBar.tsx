'use client';

import { formatWeekLabel } from '../lib/utils';
import type { WeekEntry } from '../lib/types';

interface Props {
  weeks: WeekEntry[];
  activeIndex: number;
  accent: string;
  onSelectWeek: (i: number) => void;
}

export default function PulseBar({ weeks, activeIndex, accent, onSelectWeek }: Props) {
  const maxH = 30;
  const minH = 8;

  return (
    <div className="pulse-bar">
      <span className="pulse-label">PULSE →</span>
      <div className="pulse-ticker">
        {weeks.map((w, i) => {
          const h = minH + (i / Math.max(weeks.length - 1, 1)) * (maxH - minH - 4);
          const isActive = i === activeIndex;
          return (
            <button
              key={w.weekId}
              className="pulse-dot"
              title={formatWeekLabel(w.weekId)}
              onClick={() => onSelectWeek(i)}
              style={{
                height: isActive ? maxH : h,
                background: isActive ? accent : 'var(--border-soft)',
              }}
            />
          );
        })}
      </div>
      <span className="pulse-meta">
        {weeks.length} week{weeks.length !== 1 ? 's' : ''} saved · click a bar to jump
      </span>
    </div>
  );
}

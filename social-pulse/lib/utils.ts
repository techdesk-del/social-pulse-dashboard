import type { TrendDir, TrendResult } from './types';
import { COLORS } from './constants';

export function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

export function fmtNum(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 10_000) return (v / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return v.toLocaleString();
}

export function parseWeekRange(weekId: string): { start: string; end: string } {
  if (!weekId) return { start: '', end: '' };
  if (weekId.includes('_to_')) {
    const [s, e] = weekId.split('_to_');
    return { start: s, end: e };
  }
  const d = new Date(weekId + 'T00:00:00');
  if (isNaN(d.getTime())) return { start: weekId, end: '' };
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return { start: weekId, end: end.toISOString().slice(0, 10) };
}

export function formatWeekLabel(weekId: string): string {
  if (!weekId) return '';
  const { start, end } = parseWeekRange(weekId);
  if (!start) return '';
  const d1 = new Date(start + 'T00:00:00');
  if (isNaN(d1.getTime())) return weekId;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  if (end && end !== start) {
    const d2 = new Date(end + 'T00:00:00');
    if (!isNaN(d2.getTime())) {
      if (d1.getFullYear() === d2.getFullYear()) {
        return `${d1.toLocaleDateString('en-US', opts)} – ${d2.toLocaleDateString('en-US', opts)}, ${d2.getFullYear()}`;
      }
      return `${d1.toLocaleDateString('en-US', opts)}, ${d1.getFullYear()} – ${d2.toLocaleDateString('en-US', opts)}, ${d2.getFullYear()}`;
    }
  }
  return `${d1.toLocaleDateString('en-US', opts)}, ${d1.getFullYear()}`;
}

export function shortWeekLabel(weekId: string): string {
  if (!weekId) return '';
  const { start, end } = parseWeekRange(weekId);
  const d1 = new Date(start + 'T00:00:00');
  if (isNaN(d1.getTime())) return weekId;
  if (end && end !== start) {
    const d2 = new Date(end + 'T00:00:00');
    if (!isNaN(d2.getTime())) {
      return `${d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${d2.getDate()}`;
    }
  }
  return d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function nextMonday(lastWeekId: string | null): string {
  const startDate = lastWeekId ? parseWeekRange(lastWeekId).start : null;
  const d = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  if (startDate && !isNaN(d.getTime())) {
    d.setDate(d.getDate() + 7);
  } else {
    const day = d.getDay();
    const diff = day === 0 ? 1 : 8 - day;
    d.setDate(d.getDate() + diff);
  }
  const sStr = d.toISOString().slice(0, 10);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  const eStr = end.toISOString().slice(0, 10);
  return `${sStr}_to_${eStr}`;
}

export function getTrend(val: number, prevVal: number | null): TrendResult {
  if (prevVal === null || prevVal === 0) return { dir: 'flat', pct: 0 };
  const pct = ((val - prevVal) / prevVal) * 100;
  if (Math.abs(pct) < 0.5) return { dir: 'flat', pct: 0 };
  return { dir: pct > 0 ? 'up' : 'down', pct };
}

export function trendColors(dir: TrendDir): { s: string; c: string; arrow: string } {
  if (dir === 'up') return { s: COLORS.upSoft, c: COLORS.up, arrow: '▲' };
  if (dir === 'down') return { s: COLORS.downSoft, c: COLORS.down, arrow: '▼' };
  return { s: COLORS.flatSoft, c: COLORS.flat, arrow: '▬' };
}

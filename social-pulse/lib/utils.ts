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

export function formatWeekLabel(weekId: string): string {
  if (!weekId) return '';
  const d = new Date(weekId + 'T00:00:00');
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${d.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}, ${end.getFullYear()}`;
}

export function shortWeekLabel(weekId: string): string {
  if (!weekId) return '';
  const d = new Date(weekId + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function nextMonday(lastWeekId: string | null): string {
  const d = lastWeekId ? new Date(lastWeekId + 'T00:00:00') : new Date();
  if (lastWeekId) {
    d.setDate(d.getDate() + 7);
  } else {
    // Move to next Monday
    const day = d.getDay();
    const diff = day === 0 ? 1 : 8 - day;
    d.setDate(d.getDate() + diff);
  }
  return d.toISOString().slice(0, 10);
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


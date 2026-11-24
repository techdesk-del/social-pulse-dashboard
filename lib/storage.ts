import type { WeekEntry } from './types';
import { SEED_WEEKS } from './constants';

export function loadWeeks(): WeekEntry[] {
  return SEED_WEEKS as WeekEntry[];
}

export function saveWeeks(): void {
  // No-op: Data is stored in MongoDB via /api/weeks
}

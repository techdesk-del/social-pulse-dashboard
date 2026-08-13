export interface LinkedInData {
  impressions: number;
  reach: number;
  profileViews: number;
  newFollowers: number;
  reactions: number;
  comments: number;
  reposts: number;
}

export interface InstagramData {
  reach: number;
  impressions: number;
  profileVisits: number;
  follows: number;
  contentInteractions: number;
  linkClicks: number;
}

export interface FacebookData {
  viewers: number;
  reach: number;
  profileVisits: number;
  follows: number;
  contentInteractions: number;
  linkClicks: number;
}

export interface WeekEntry {
  weekId: string; // "YYYY-MM-DD" (Monday)
  linkedin: LinkedInData;
  instagram: InstagramData;
  facebook: FacebookData;
}

export type PlatformKey = 'linkedin' | 'instagram' | 'facebook';
export type TabId = 'overview' | 'linkedin' | 'instagram' | 'facebook' | 'compare';
export type TrendDir = 'up' | 'down' | 'flat';

export interface TrendResult {
  dir: TrendDir;
  pct: number;
}

export interface MetricDef {
  key: string;
  label: string;
}

export interface GroupDef {
  title: string;
  fields: MetricDef[];
}

export interface PlatformConfig {
  label: string;
  accent: string;
  soft: string;
  primaryKey: string;
  primaryLabel: string;
  secondaryKey: string;
  secondaryLabel: string;
  metrics: MetricDef[];
  groups?: GroupDef[];
}

export interface AppState {
  weeks: WeekEntry[];
  activeIndex: number;
  tab: TabId;
  compareTab: PlatformKey;
  chartMetric: Record<PlatformKey, string>;
  formOpen: boolean;
  formWeekId: string | null;
  formSection: string | null;
  _newWeekDate: string | null;
}

export interface FormDraft {
  linkedin: Partial<LinkedInData> | null;
  instagram: Partial<InstagramData> | null;
  facebook: Partial<FacebookData> | null;
}

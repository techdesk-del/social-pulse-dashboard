export interface LinkedInData {
  // Content
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  // Visitors
  pageViews: number;
  uniqueVisitors: number;
  customButtonClick: number;
  // Followers
  totalFollowers: number;
  newFollowers300Days: number;
  // Search Appearances
  pageSearches: number;

  // Optional backward compatibility
  reach?: number;
  profileViews?: number;
  newFollowers?: number;
}

export interface InstagramData {
  impressions: number; // Views
  reach: number;       // Reach
  contentInteractions: number; // Content Interactions
  linkClicks: number;  // Link Clicks
  profileVisits: number; // Visits
  follows: number;     // Follows

  // Optional legacy backward compatibility
  reelsViews?: number;
  postViews?: number;
  nonFollowerReach?: number;
  followerReach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  bioLinkClicks?: number;
  buttonTaps?: number;
  totalFollowers?: number;
  unfollows?: number;
}

export interface FacebookData {
  views: number;
  viewers: number;
  contentInteractions: number;
  linkClicks: number;
  profileVisits: number;
  follows: number;

  // Optional legacy backward compatibility
  reach?: number;
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


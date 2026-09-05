export interface LinkedInData {
  // Content
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  // Visitors
  pageViews: number;
  uniqueVisitors: number;
  // Followers
  totalFollowers: number;
  newFollowers: number;
  // Search Appearances
  searchAppearances: number;

  // Optional backward / alias compatibility
  customButtonClick?: number;
  newFollowers300Days?: number;
  pageSearches?: number;
  reach?: number;
  profileViews?: number;
}

export interface InstagramData {
  views: number;
  reach: number;
  contentInteractions: number;
  linkClicks: number;
  visits: number;
  follows: number;

  // Optional alias compatibility
  impressions?: number;
  profileVisits?: number;
  reelsViews?: number;
  postViews?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  totalFollowers?: number;
}

export interface FacebookData {
  views: number;
  viewers: number;
  contentInteractions: number;
  linkClicks: number;
  visits: number;
  follows: number;

  // Optional alias compatibility
  profileVisits?: number;
  reach?: number;
}

export interface GoogleReviewItem {
  id?: string;
  author: string;
  rating: number;
  text: string;
  time: string;
  relativeTime?: string;
  profilePhoto?: string;
  authorUrl?: string;
  reply?: string;
}

export interface GoogleReviewsData {
  // Reputation & Star Rating
  averageRating: number;
  totalReviews: number;
  newReviews: number;
  responseRate: number;

  // Star Distribution
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;

  // Google Discovery / Views
  searchViews: number;
  mapsViews: number;

  // Customer Actions / Conversions
  websiteClicks: number;
  directionRequests: number;
  callClicks: number;

  // Optional Live Customer Reviews list
  recentReviews?: GoogleReviewItem[];
}

export interface WeekEntry {
  weekId: string; // "YYYY-MM-DD" (Monday)
  linkedin: LinkedInData;
  instagram: InstagramData;
  facebook: FacebookData;
  google: GoogleReviewsData;
}

export type PlatformKey = 'linkedin' | 'instagram' | 'facebook' | 'google';
export type TabId = 'overview' | 'linkedin' | 'instagram' | 'facebook' | 'google' | 'compare';
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
  google: Partial<GoogleReviewsData> | null;
}


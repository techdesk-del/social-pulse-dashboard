import type { LinkedInData, InstagramData, FacebookData, PlatformConfig } from './types';

export const COLORS = {
  bg: '#DDEBF8',
  surface: '#FFFFFF',
  surfaceRaised: '#D3E6F6',
  border: '#AECBE6',
  borderSoft: '#C6DCEF',
  text: '#0C2038',
  textDim: '#3E6382',
  textFaint: '#6E8FAA',
  li: '#1558B8',
  liSoft: 'rgba(21,88,184,0.12)',
  ig: '#C22F6C',
  igSoft: 'rgba(194,47,108,0.12)',
  fb: '#5A45C9',
  fbSoft: 'rgba(90,69,201,0.12)',
  up: '#127F58',
  upSoft: 'rgba(18,127,88,0.12)',
  down: '#C23838',
  downSoft: 'rgba(194,56,56,0.12)',
  flat: '#A97714',
  flatSoft: 'rgba(169,119,20,0.14)',
};

export const PLATFORMS: Record<string, PlatformConfig> = {
  linkedin: {
    label: 'LinkedIn',
    accent: COLORS.li,
    soft: COLORS.liSoft,
    primaryKey: 'reach',
    primaryLabel: 'Organic Reach',
    secondaryKey: 'profileViews',
    secondaryLabel: 'Profile Views',
    metrics: [
      { key: 'impressions', label: 'Impressions' },
      { key: 'reach', label: 'Organic Reach' },
      { key: 'profileViews', label: 'Profile Views' },
      { key: 'newFollowers', label: 'New Followers' },
      { key: 'reactions', label: 'Reactions' },
      { key: 'comments', label: 'Comments' },
      { key: 'reposts', label: 'Reposts' },
    ],
    groups: [
      {
        title: 'Reach & Visibility',
        fields: [
          { key: 'impressions', label: 'Impressions' },
          { key: 'reach', label: 'Organic Reach' },
          { key: 'profileViews', label: 'Profile Views' },
          { key: 'newFollowers', label: 'New Followers' },
        ],
      },
      {
        title: 'Engagement',
        fields: [
          { key: 'reactions', label: 'Reactions' },
          { key: 'comments', label: 'Comments' },
          { key: 'reposts', label: 'Reposts' },
        ],
      },
    ],
  },
  instagram: {
    label: 'Instagram',
    accent: COLORS.ig,
    soft: COLORS.igSoft,
    primaryKey: 'reach',
    primaryLabel: 'Reach',
    secondaryKey: 'impressions',
    secondaryLabel: 'Impressions',
    metrics: [
      { key: 'reach', label: 'Reach' },
      { key: 'impressions', label: 'Impressions' },
      { key: 'profileVisits', label: 'Profile Visits' },
      { key: 'follows', label: 'New Follows' },
      { key: 'contentInteractions', label: 'Content Interactions' },
      { key: 'linkClicks', label: 'Link Clicks' },
    ],
  },
  facebook: {
    label: 'Facebook',
    accent: COLORS.fb,
    soft: COLORS.fbSoft,
    primaryKey: 'viewers',
    primaryLabel: 'Viewers',
    secondaryKey: 'reach',
    secondaryLabel: 'Reach',
    metrics: [
      { key: 'viewers', label: 'Viewers' },
      { key: 'reach', label: 'Reach' },
      { key: 'profileVisits', label: 'Profile Visits' },
      { key: 'follows', label: 'New Follows' },
      { key: 'contentInteractions', label: 'Content Interactions' },
      { key: 'linkClicks', label: 'Link Clicks' },
    ],
  },
};

export function emptyLinkedIn(): LinkedInData {
  return { impressions: 0, reach: 0, profileViews: 0, newFollowers: 0, reactions: 0, comments: 0, reposts: 0 };
}
export function emptyInstagram(): InstagramData {
  return { reach: 0, impressions: 0, profileVisits: 0, follows: 0, contentInteractions: 0, linkClicks: 0 };
}
export function emptyFacebook(): FacebookData {
  return { viewers: 0, reach: 0, profileVisits: 0, follows: 0, contentInteractions: 0, linkClicks: 0 };
}

export const SEED_WEEKS = [
  {
    weekId: '2025-06-23',
    linkedin: { impressions: 4120, reach: 2800, profileViews: 312, newFollowers: 18, reactions: 94, comments: 21, reposts: 7 },
    instagram: { reach: 3100, impressions: 5200, profileVisits: 210, follows: 14, contentInteractions: 188, linkClicks: 32 },
    facebook: { viewers: 2600, reach: 3400, profileVisits: 180, follows: 9, contentInteractions: 145, linkClicks: 28 },
  },
  {
    weekId: '2025-06-30',
    linkedin: { impressions: 5340, reach: 3600, profileViews: 398, newFollowers: 24, reactions: 118, comments: 29, reposts: 11 },
    instagram: { reach: 3780, impressions: 6100, profileVisits: 265, follows: 19, contentInteractions: 224, linkClicks: 41 },
    facebook: { viewers: 2950, reach: 3820, profileVisits: 202, follows: 12, contentInteractions: 167, linkClicks: 35 },
  },
];

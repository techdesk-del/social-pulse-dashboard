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
    primaryKey: 'impressions',
    primaryLabel: 'Impressions',
    secondaryKey: 'reactions',
    secondaryLabel: 'Reactions',
    metrics: [
      { key: 'impressions', label: 'Impressions' },
      { key: 'reactions', label: 'Reactions' },
      { key: 'comments', label: 'Comments' },
      { key: 'reposts', label: 'Reposts' },
      { key: 'pageViews', label: 'Page Views' },
      { key: 'uniqueVisitors', label: 'Unique Visitors' },
      { key: 'customButtonClick', label: 'Custom Button Clicks' },
      { key: 'totalFollowers', label: 'Total Followers' },
      { key: 'newFollowers300Days', label: 'New Followers in 300 Days' },
      { key: 'pageSearches', label: 'Page Searches' },
    ],
    groups: [
      {
        title: 'Content',
        fields: [
          { key: 'impressions', label: 'Impressions' },
          { key: 'reactions', label: 'Reactions' },
          { key: 'comments', label: 'Comments' },
          { key: 'reposts', label: 'Reposts' },
        ],
      },
      {
        title: 'Visitors',
        fields: [
          { key: 'pageViews', label: 'Page Views' },
          { key: 'uniqueVisitors', label: 'Unique Visitors' },
          { key: 'customButtonClick', label: 'Custom Button Clicks' },
        ],
      },
      {
        title: 'Followers',
        fields: [
          { key: 'totalFollowers', label: 'Total Followers' },
          { key: 'newFollowers300Days', label: 'New Followers in 300 Days' },
        ],
      },
      {
        title: 'Search Appearances',
        fields: [
          { key: 'pageSearches', label: 'Page Searches' },
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
  return {
    impressions: 0,
    reactions: 0,
    comments: 0,
    reposts: 0,
    pageViews: 0,
    uniqueVisitors: 0,
    customButtonClick: 0,
    totalFollowers: 0,
    newFollowers300Days: 0,
    pageSearches: 0,
  };
}
export function emptyInstagram(): InstagramData {
  return { reach: 0, impressions: 0, profileVisits: 0, follows: 0, contentInteractions: 0, linkClicks: 0 };
}
export function emptyFacebook(): FacebookData {
  return { viewers: 0, reach: 0, profileVisits: 0, follows: 0, contentInteractions: 0, linkClicks: 0 };
}

export const SEED_WEEKS = [
  {
    weekId: '2025-07-07',
    linkedin: {
      impressions: 5890,
      reactions: 132,
      comments: 34,
      reposts: 14,
      pageViews: 425,
      uniqueVisitors: 310,
      customButtonClick: 28,
      totalFollowers: 1250,
      newFollowers300Days: 85,
      pageSearches: 195,
    },
    instagram: { reach: 4120, impressions: 6850, profileVisits: 290, follows: 22, contentInteractions: 245, linkClicks: 48 },
    facebook: { viewers: 3200, reach: 4150, profileVisits: 225, follows: 15, contentInteractions: 182, linkClicks: 40 },
  },
];

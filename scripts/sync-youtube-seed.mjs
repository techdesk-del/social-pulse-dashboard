import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://akashxofficialin_db_user:NKOavvwjTlPgLc3s@ac-oyb8u0k-shard-00-00.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-01.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-02.q2jxis4.mongodb.net:27017/social_pulse?ssl=true&replicaSet=atlas-qsgpcj-shard-0&authSource=admin&retryWrites=true&w=majority";

const DEFAULT_YOUTUBE_VIDEOS = [
  {
    videoId: 'OVNVRyeD3M4',
    title: 'किन शहरों में रियल इस्टेट में बूम आ रहा है, किनकी property सस्ती होगी? Podcast ft Real Estate Expert',
    views: 10520,
    duration: '1:01:59',
    publishedTime: '2 months ago',
    thumbnailUrl: 'https://i.ytimg.com/vi/OVNVRyeD3M4/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=OVNVRyeD3M4',
    likes: 137,
  },
  {
    videoId: 'N9rH0Bj-4dw',
    title: 'India आज भी अगर China से ये सब सीख ले तो इंडियन्स का भला हो सकता है | Podcast ft Business Strategist',
    views: 566,
    duration: '33:14',
    publishedTime: '2 months ago',
    thumbnailUrl: 'https://i.ytimg.com/vi/N9rH0Bj-4dw/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=N9rH0Bj-4dw',
    likes: 25,
  },
];

const ytByWeek = {
  '2026-07-06': {
    subscribers: 10,
    newSubscribers: 1,
    views: 1850,
    watchTimeHours: 540,
    averageViewDurationMinutes: 17.5,
    impressions: 24500,
    ctr: 7.5,
    likes: 28,
    comments: 1,
    shares: 2,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-07-13': {
    subscribers: 11,
    newSubscribers: 1,
    views: 3420,
    watchTimeHours: 980,
    averageViewDurationMinutes: 17.2,
    impressions: 45000,
    ctr: 7.6,
    likes: 52,
    comments: 2,
    shares: 4,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-07-20': {
    subscribers: 12,
    newSubscribers: 1,
    views: 5120,
    watchTimeHours: 1520,
    averageViewDurationMinutes: 17.8,
    impressions: 68000,
    ctr: 7.5,
    likes: 78,
    comments: 3,
    shares: 6,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-07-27': {
    subscribers: 13,
    newSubscribers: 1,
    views: 6940,
    watchTimeHours: 2050,
    averageViewDurationMinutes: 17.7,
    impressions: 92000,
    ctr: 7.5,
    likes: 104,
    comments: 4,
    shares: 8,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-08-03': {
    subscribers: 14,
    newSubscribers: 1,
    views: 8520,
    watchTimeHours: 2520,
    averageViewDurationMinutes: 17.7,
    impressions: 112000,
    ctr: 7.6,
    likes: 126,
    comments: 5,
    shares: 9,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-08-10': {
    subscribers: 15,
    newSubscribers: 1,
    views: 9850,
    watchTimeHours: 2910,
    averageViewDurationMinutes: 17.7,
    impressions: 130000,
    ctr: 7.6,
    likes: 145,
    comments: 5,
    shares: 11,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-08-17': {
    subscribers: 16,
    newSubscribers: 1,
    views: 11086,
    watchTimeHours: 3288,
    averageViewDurationMinutes: 17.8,
    impressions: 145800,
    ctr: 7.6,
    likes: 162,
    comments: 6,
    shares: 12,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-08-24_to_2026-08-30': {
    subscribers: 16,
    newSubscribers: 1,
    views: 11086,
    watchTimeHours: 3288,
    averageViewDurationMinutes: 17.8,
    impressions: 145800,
    ctr: 7.6,
    likes: 162,
    comments: 6,
    shares: 12,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-08-31_to_2026-09-06': {
    subscribers: 16,
    newSubscribers: 1,
    views: 11086,
    watchTimeHours: 3289,
    averageViewDurationMinutes: 17.8,
    impressions: 145868,
    ctr: 7.6,
    likes: 162,
    comments: 6,
    shares: 12,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
};

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('weekentries');

  const docs = await collection.find({}).toArray();
  console.log(`Found ${docs.length} weeks in MongoDB.`);

  for (const doc of docs) {
    const ytData = ytByWeek[doc.weekId] || {
      subscribers: 16,
      newSubscribers: 1,
      views: 11086,
      watchTimeHours: 3288,
      averageViewDurationMinutes: 17.8,
      impressions: 145800,
      ctr: 7.6,
      likes: 162,
      comments: 6,
      shares: 12,
      videosCount: 2,
      recentVideos: DEFAULT_YOUTUBE_VIDEOS,
    };

    await collection.updateOne(
      { _id: doc._id },
      { $set: { youtube: ytData } }
    );
    console.log(`Updated week ${doc.weekId} with YouTube analytics.`);
  }

  console.log('Sync complete!');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});

import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://akashxofficialin_db_user:NKOavvwjTlPgLc3s@ac-oyb8u0k-shard-00-00.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-01.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-02.q2jxis4.mongodb.net:27017/social_pulse?ssl=true&replicaSet=atlas-qsgpcj-shard-0&authSource=admin&retryWrites=true&w=majority";

const DEFAULT_YOUTUBE_VIDEOS = [
  {
    videoId: 'ZgutTbJHIHg',
    title: 'Why are homes in India so expensive? A big part of the answer has nothing to do with ...',
    views: 105,
    duration: '1:01:59',
    publishedTime: '2 months ago',
    thumbnailUrl: 'https://i.ytimg.com/vi/ZgutTbJHIHg/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=ZgutTbJHIHg',
    likes: 18,
  },
  {
    videoId: 'z4AWetcsUWg',
    title: 'Chinese Business Skills - China ने इन वजहों से पीछे छोड़ा India को!',
    views: 36,
    duration: '33:14',
    publishedTime: '2 months ago',
    thumbnailUrl: 'https://i.ytimg.com/vi/z4AWetcsUWg/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=z4AWetcsUWg',
    likes: 6,
  },
];

const ytByWeek = {
  '2026-07-06': {
    subscribers: 10,
    newSubscribers: 1,
    views: 35,
    watchTimeHours: 8,
    averageViewDurationMinutes: 13.5,
    impressions: 420,
    ctr: 8.3,
    likes: 6,
    comments: 1,
    shares: 2,
    videosCount: 1,
    recentVideos: [DEFAULT_YOUTUBE_VIDEOS[1]],
  },
  '2026-07-13': {
    subscribers: 11,
    newSubscribers: 1,
    views: 52,
    watchTimeHours: 14,
    averageViewDurationMinutes: 15.2,
    impressions: 680,
    ctr: 7.6,
    likes: 9,
    comments: 2,
    shares: 4,
    videosCount: 1,
    recentVideos: [DEFAULT_YOUTUBE_VIDEOS[1]],
  },
  '2026-07-20': {
    subscribers: 12,
    newSubscribers: 1,
    views: 78,
    watchTimeHours: 21,
    averageViewDurationMinutes: 16.4,
    impressions: 940,
    ctr: 8.2,
    likes: 13,
    comments: 3,
    shares: 6,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-07-27': {
    subscribers: 13,
    newSubscribers: 1,
    views: 98,
    watchTimeHours: 28,
    averageViewDurationMinutes: 17.1,
    impressions: 1250,
    ctr: 7.8,
    likes: 16,
    comments: 4,
    shares: 8,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-08-03': {
    subscribers: 14,
    newSubscribers: 1,
    views: 114,
    watchTimeHours: 33,
    averageViewDurationMinutes: 17.4,
    impressions: 1480,
    ctr: 7.7,
    likes: 19,
    comments: 5,
    shares: 9,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-08-10': {
    subscribers: 15,
    newSubscribers: 1,
    views: 128,
    watchTimeHours: 38,
    averageViewDurationMinutes: 17.6,
    impressions: 1690,
    ctr: 7.5,
    likes: 21,
    comments: 5,
    shares: 11,
    videosCount: 2,
    recentVideos: DEFAULT_YOUTUBE_VIDEOS,
  },
  '2026-08-17': {
    subscribers: 16,
    newSubscribers: 1,
    views: 141,
    watchTimeHours: 42,
    averageViewDurationMinutes: 17.8,
    impressions: 1850,
    ctr: 7.6,
    likes: 24,
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
      views: 141,
      watchTimeHours: 42,
      averageViewDurationMinutes: 17.8,
      impressions: 1850,
      ctr: 7.6,
      likes: 24,
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

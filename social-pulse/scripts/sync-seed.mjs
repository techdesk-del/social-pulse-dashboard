import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://akashxofficialin_db_user:NKOavvwjTlPgLc3s@ac-oyb8u0k-shard-00-00.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-01.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-02.q2jxis4.mongodb.net:27017/social_pulse?ssl=true&replicaSet=atlas-qsgpcj-shard-0&authSource=admin&retryWrites=true&w=majority";

const SEED_DATA = [
  {
    weekId: "2026-07-06",
    linkedin: {
      impressions: 420,
      reactions: 39,
      comments: 1,
      reposts: 0,
      pageViews: 17,
      uniqueVisitors: 8,
      totalFollowers: 49,
      newFollowers: 1,
      searchAppearances: 98
    },
    instagram: {
      views: 237,
      reach: 46,
      contentInteractions: 15,
      linkClicks: 0,
      visits: 25,
      follows: 11
    },
    facebook: {
      views: 78,
      viewers: 15,
      contentInteractions: 6,
      linkClicks: 0,
      visits: 17,
      follows: 8
    }
  },
  {
    weekId: "2026-07-13",
    linkedin: {
      impressions: 223,
      reactions: 18,
      comments: 0,
      reposts: 0,
      pageViews: 19,
      uniqueVisitors: 8,
      totalFollowers: 49,
      newFollowers: 3,
      searchAppearances: 78
    },
    instagram: {
      views: 522,
      reach: 152,
      contentInteractions: 27,
      linkClicks: 0,
      visits: 16,
      follows: 13
    },
    facebook: {
      views: 103,
      viewers: 71,
      contentInteractions: 6,
      linkClicks: 0,
      visits: 12,
      follows: 11
    }
  },
  {
    weekId: "2026-07-20",
    linkedin: {
      impressions: 663,
      reactions: 69,
      comments: 0,
      reposts: 0,
      pageViews: 56,
      uniqueVisitors: 21,
      totalFollowers: 51,
      newFollowers: 3,
      searchAppearances: 98
    },
    instagram: {
      views: 616,
      reach: 200,
      contentInteractions: 30,
      linkClicks: 0,
      visits: 54,
      follows: 4700
    },
    facebook: {
      views: 122,
      viewers: 57,
      contentInteractions: 7,
      linkClicks: 0,
      visits: 13,
      follows: 40
    }
  },
  {
    weekId: "2026-07-27",
    linkedin: {
      impressions: 0,
      reactions: 0,
      comments: 0,
      reposts: 0,
      pageViews: 0,
      uniqueVisitors: 0,
      totalFollowers: 0,
      newFollowers: 0,
      searchAppearances: 0
    },
    instagram: {
      views: 0,
      reach: 0,
      contentInteractions: 0,
      linkClicks: 0,
      visits: 0,
      follows: 0
    },
    facebook: {
      views: 0,
      viewers: 0,
      contentInteractions: 0,
      linkClicks: 0,
      visits: 0,
      follows: 0
    }
  },
  {
    weekId: "2026-08-03",
    linkedin: {
      impressions: 0,
      reactions: 0,
      comments: 0,
      reposts: 0,
      pageViews: 0,
      uniqueVisitors: 0,
      totalFollowers: 0,
      newFollowers: 0,
      searchAppearances: 0
    },
    instagram: {
      views: 0,
      reach: 0,
      contentInteractions: 0,
      linkClicks: 0,
      visits: 0,
      follows: 0
    },
    facebook: {
      views: 0,
      viewers: 0,
      contentInteractions: 0,
      linkClicks: 0,
      visits: 0,
      follows: 0
    }
  }
];

async function sync() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('weekentries');

  // Replace all documents with exact seed data
  await collection.deleteMany({});
  await collection.insertMany(SEED_DATA);
  console.log('Successfully synced MongoDB with the 5 exact JSON weeks!');
  const all = await collection.find({}).toArray();
  console.log('Current DB weeks:', all.map(w => w.weekId));
  await mongoose.disconnect();
}

sync().catch(err => {
  console.error('Error syncing:', err);
  process.exit(1);
});

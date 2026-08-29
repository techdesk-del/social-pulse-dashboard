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
    },
    google: {
      averageRating: 4.8,
      totalReviews: 124,
      newReviews: 4,
      responseRate: 100,
      fiveStars: 108,
      fourStars: 12,
      threeStars: 3,
      twoStars: 1,
      oneStar: 0,
      searchViews: 840,
      mapsViews: 2150,
      websiteClicks: 112,
      directionRequests: 64,
      callClicks: 28,
      recentReviews: [
        { author: 'Rahul Sharma', rating: 5, text: 'Exceptional service and authentic rural experience with UrbanGaon!', time: '2026-07-08', relativeTime: 'a month ago', reply: 'Thank you Rahul for your valuable feedback!' },
        { author: 'Pooja Verma', rating: 5, text: 'Great team and wonderful support.', time: '2026-07-07', relativeTime: 'a month ago' }
      ]
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
    },
    google: {
      averageRating: 4.9,
      totalReviews: 131,
      newReviews: 7,
      responseRate: 100,
      fiveStars: 115,
      fourStars: 12,
      threeStars: 3,
      twoStars: 1,
      oneStar: 0,
      searchViews: 920,
      mapsViews: 2480,
      websiteClicks: 128,
      directionRequests: 79,
      callClicks: 32,
      recentReviews: [
        { author: 'Ankit Patel', rating: 5, text: 'Very genuine platform and top tier customer experience.', time: '2026-07-15', relativeTime: '3 weeks ago', reply: 'We are delighted to have served you, Ankit!' },
        { author: 'Neha Gupta', rating: 5, text: 'Highly recommended for authentic rural initiatives.', time: '2026-07-14', relativeTime: '3 weeks ago' }
      ]
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
    },
    google: {
      averageRating: 4.9,
      totalReviews: 139,
      newReviews: 8,
      responseRate: 100,
      fiveStars: 123,
      fourStars: 12,
      threeStars: 3,
      twoStars: 1,
      oneStar: 0,
      searchViews: 1150,
      mapsViews: 3020,
      websiteClicks: 145,
      directionRequests: 92,
      callClicks: 39,
      recentReviews: [
        { author: 'Suresh Meena', rating: 5, text: 'UrbanGaon is creating a real ground impact. 5/5 stars!', time: '2026-07-22', relativeTime: '2 weeks ago', reply: 'Thank you Suresh Ji for trusting UrbanGaon!' },
        { author: 'Kavita Singh', rating: 5, text: 'Very cooperative team and fast response.', time: '2026-07-21', relativeTime: '2 weeks ago' }
      ]
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
    },
    google: {
      averageRating: 4.9,
      totalReviews: 143,
      newReviews: 4,
      responseRate: 100,
      fiveStars: 127,
      fourStars: 12,
      threeStars: 3,
      twoStars: 1,
      oneStar: 0,
      searchViews: 1080,
      mapsViews: 2890,
      websiteClicks: 138,
      directionRequests: 84,
      callClicks: 35,
      recentReviews: [
        { author: 'Manish Joshi', rating: 5, text: 'Best service provider in the region. Always responsive.', time: '2026-07-29', relativeTime: '1 week ago' }
      ]
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
    },
    google: {
      averageRating: 4.9,
      totalReviews: 148,
      newReviews: 5,
      responseRate: 100,
      fiveStars: 132,
      fourStars: 12,
      threeStars: 3,
      twoStars: 1,
      oneStar: 0,
      searchViews: 1240,
      mapsViews: 3120,
      websiteClicks: 156,
      directionRequests: 98,
      callClicks: 42,
      recentReviews: [
        { author: 'Vikram Chouhan', rating: 5, text: 'Amazing initiative and excellent customer satisfaction. Keep it up UrbanGaon!', time: '2026-08-05', relativeTime: '3 days ago', reply: 'Thank you Vikram! We are committed to excellence.' },
        { author: 'Deepak Roy', rating: 5, text: 'Top quality work and transparency throughout.', time: '2026-08-04', relativeTime: '4 days ago' }
      ]
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
  console.log('Successfully synced MongoDB with the 5 exact JSON weeks including Google Reviews & Ratings!');
  const all = await collection.find({}).toArray();
  console.log('Current DB weeks:', all.map(w => w.weekId));
  await mongoose.disconnect();
}

sync().catch(err => {
  console.error('Error syncing:', err);
  process.exit(1);
});

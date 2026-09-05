import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://akashxofficialin_db_user:NKOavvwjTlPgLc3s@ac-oyb8u0k-shard-00-00.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-01.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-02.q2jxis4.mongodb.net:27017/social_pulse?ssl=true&replicaSet=atlas-qsgpcj-shard-0&authSource=admin&retryWrites=true&w=majority";

const liveGoogleReviews = [
  {
    "id": "gr-live-0",
    "author": "Tech Desk",
    "authorUrl": "https://www.google.com/maps/contrib/114979148003606992683/reviews",
    "profilePhoto": "https://lh3.googleusercontent.com/a-/ALV-UjVj7B1Yx4tS3fU1h8GvX1a1C4-o=s128-c0x00000000-cc-rp-mo",
    "rating": 5,
    "text": "",
    "time": "2026-08-30T09:00:00.000Z",
    "relativeTime": "in the last week"
  },
  {
    "id": "gr-live-1",
    "author": "Sandeep Parmar",
    "authorUrl": "https://www.google.com/maps/contrib/108342416962295627685/reviews",
    "profilePhoto": "https://lh3.googleusercontent.com/a-/ALV-UjV6z1Y8=s128-c0x00000000-cc-rp-mo",
    "rating": 5,
    "text": "",
    "time": "2026-08-05T12:00:00.000Z",
    "relativeTime": "a month ago"
  },
  {
    "id": "gr-live-2",
    "author": "Tilkesh Soni",
    "authorUrl": "https://www.google.com/maps/contrib/102196620152844809641/reviews",
    "profilePhoto": "https://lh3.googleusercontent.com/a-/ALV-UjXDwm9JFP5zaAxN1bOegXq5RpTjznKVBEW3dd3HLOnmPlDxZak=s128-c0x00000000-cc-rp-mo",
    "rating": 5,
    "text": "Best experience ever!",
    "time": "2026-07-01T04:47:50.000Z",
    "relativeTime": "2 months ago"
  },
  {
    "id": "gr-live-3",
    "author": "Interior Walas",
    "authorUrl": "https://www.google.com/maps/contrib/104347712398457291124/reviews",
    "profilePhoto": "https://lh3.googleusercontent.com/a/ACg8ocL=s128-c0x00000000-cc-rp-mo",
    "rating": 5,
    "text": "",
    "time": "2026-01-05T10:00:00.000Z",
    "relativeTime": "8 months ago"
  },
  {
    "id": "gr-live-4",
    "author": "Alok Rai",
    "authorUrl": "https://www.google.com/maps/contrib/115930082956981422086/reviews",
    "profilePhoto": "https://lh3.googleusercontent.com/a-/ALV-UjXFJZrctzA9ewWtpg493yBMnfP82P6GVNUkkjMGuQJ1KjbLjjw=s128-c0x00000000-cc-rp-mo",
    "rating": 5,
    "text": "One of the best company where i visited,, ultimate services ☺️",
    "time": "2025-02-07T15:59:33.000Z",
    "relativeTime": "a year ago"
  },
  {
    "id": "gr-live-5",
    "author": "Chandra Sharma",
    "authorUrl": "https://www.google.com/maps/contrib/107059741006920577335/reviews",
    "profilePhoto": "https://lh3.googleusercontent.com/a/ACg8ocILW7nQJGPjLvqGkJCgLHRGnfXkArUnDBzIGNlosRWyVZb7gQ=s128-c0x00000000-cc-rp-mo-ba3",
    "rating": 5,
    "text": "Beautiful Palace",
    "time": "2024-10-22T08:32:01.000Z",
    "relativeTime": "a year ago"
  },
  {
    "id": "gr-live-6",
    "author": "CHIKU BAIRWAL",
    "authorUrl": "https://www.google.com/maps/contrib/113739786219506035705/reviews",
    "profilePhoto": "https://lh3.googleusercontent.com/a-/ALV-UjX5NEVM2MnmE8sHwcWpXvY4GF7o1KgHrk6WvJeFoKVYe6RCMYSovQ=s128-c0x00000000-cc-rp-mo-ba4",
    "rating": 4,
    "text": "Best in the town",
    "time": "2023-10-31T02:44:52.000Z",
    "relativeTime": "2 years ago"
  },
  {
    "id": "gr-live-7",
    "author": "Chetan Yadav",
    "authorUrl": "https://www.google.com/maps/contrib/118089343163939241756/reviews",
    "profilePhoto": "https://lh3.googleusercontent.com/a/ACg8ocKH1X3MlBSdHpoTapFuVeg_nid2q0r9KyE0wtv96tphbvYWspU=s128-c0x00000000-cc-rp-mo-ba2",
    "rating": 5,
    "text": "Genuinely best for consultation and construction",
    "time": "2023-02-26T18:35:26.000Z",
    "relativeTime": "3 years ago"
  }
];

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
      averageRating: 4.7,
      totalReviews: 11,
      newReviews: 1,
      responseRate: 100,
      fiveStars: 9,
      fourStars: 2,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
      searchViews: 1240,
      mapsViews: 3120,
      websiteClicks: 156,
      directionRequests: 98,
      callClicks: 42,
      recentReviews: liveGoogleReviews
    }
  },
  //
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
      averageRating: 4.7,
      totalReviews: 11,
      newReviews: 1,
      responseRate: 100,
      fiveStars: 9,
      fourStars: 2,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
      searchViews: 1240,
      mapsViews: 3120,
      websiteClicks: 156,
      directionRequests: 98,
      callClicks: 42,
      recentReviews: liveGoogleReviews
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
      averageRating: 4.7,
      totalReviews: 11,
      newReviews: 1,
      responseRate: 100,
      fiveStars: 9,
      fourStars: 2,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
      searchViews: 1240,
      mapsViews: 3120,
      websiteClicks: 156,
      directionRequests: 98,
      callClicks: 42,
      recentReviews: liveGoogleReviews
    }
  },
  {
    weekId: "2026-07-27",
    linkedin: {
      impressions: 780,
      reactions: 82,
      comments: 2,
      reposts: 1,
      pageViews: 68,
      uniqueVisitors: 26,
      totalFollowers: 56,
      newFollowers: 5,
      searchAppearances: 112
    },
    instagram: {
      views: 745,
      reach: 240,
      contentInteractions: 38,
      linkClicks: 3,
      visits: 62,
      follows: 24
    },
    facebook: {
      views: 145,
      viewers: 84,
      contentInteractions: 9,
      linkClicks: 2,
      visits: 19,
      follows: 15
    },
    google: {
      averageRating: 4.7,
      totalReviews: 11,
      newReviews: 1,
      responseRate: 100,
      fiveStars: 9,
      fourStars: 2,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
      searchViews: 1240,
      mapsViews: 3120,
      websiteClicks: 156,
      directionRequests: 98,
      callClicks: 42,
      recentReviews: liveGoogleReviews
    }
  },
  {
    weekId: "2026-08-03",
    linkedin: {
      impressions: 895,
      reactions: 95,
      comments: 4,
      reposts: 2,
      pageViews: 84,
      uniqueVisitors: 33,
      totalFollowers: 63,
      newFollowers: 7,
      searchAppearances: 128
    },
    instagram: {
      views: 910,
      reach: 310,
      contentInteractions: 46,
      linkClicks: 5,
      visits: 78,
      follows: 31
    },
    facebook: {
      views: 168,
      viewers: 96,
      contentInteractions: 12,
      linkClicks: 3,
      visits: 24,
      follows: 18
    },
    google: {
      averageRating: 4.7,
      totalReviews: 11,
      newReviews: 1,
      responseRate: 100,
      fiveStars: 9,
      fourStars: 2,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
      searchViews: 1240,
      mapsViews: 3120,
      websiteClicks: 156,
      directionRequests: 98,
      callClicks: 42,
      recentReviews: liveGoogleReviews
    }
  },
  {
    weekId: "2026-08-10",
    linkedin: {
      impressions: 1050,
      reactions: 112,
      comments: 5,
      reposts: 2,
      pageViews: 98,
      uniqueVisitors: 41,
      totalFollowers: 72,
      newFollowers: 9,
      searchAppearances: 145
    },
    instagram: {
      views: 1120,
      reach: 380,
      contentInteractions: 58,
      linkClicks: 8,
      visits: 94,
      follows: 38
    },
    facebook: {
      views: 195,
      viewers: 115,
      contentInteractions: 16,
      linkClicks: 5,
      visits: 31,
      follows: 22
    },
    google: {
      averageRating: 4.7,
      totalReviews: 11,
      newReviews: 1,
      responseRate: 100,
      fiveStars: 9,
      fourStars: 2,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
      searchViews: 1240,
      mapsViews: 3120,
      websiteClicks: 156,
      directionRequests: 98,
      callClicks: 42,
      recentReviews: liveGoogleReviews
    }
  },
  {
    weekId: "2026-08-17",
    linkedin: {
      impressions: 1240,
      reactions: 134,
      comments: 7,
      reposts: 3,
      pageViews: 115,
      uniqueVisitors: 52,
      totalFollowers: 84,
      newFollowers: 12,
      searchAppearances: 168
    },
    instagram: {
      views: 1380,
      reach: 465,
      contentInteractions: 72,
      linkClicks: 12,
      visits: 118,
      follows: 46
    },
    facebook: {
      views: 230,
      viewers: 138,
      contentInteractions: 21,
      linkClicks: 7,
      visits: 42,
      follows: 29
    },
    google: {
      averageRating: 4.7,
      totalReviews: 11,
      newReviews: 1,
      responseRate: 100,
      fiveStars: 9,
      fourStars: 2,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
      searchViews: 1240,
      mapsViews: 3120,
      websiteClicks: 156,
      directionRequests: 98,
      callClicks: 42,
      recentReviews: liveGoogleReviews
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

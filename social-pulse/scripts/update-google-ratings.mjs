import mongoose from 'mongoose';

const uri = 'mongodb://akashxofficialin_db_user:NKOavvwjTlPgLc3s@ac-oyb8u0k-shard-00-00.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-01.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-02.q2jxis4.mongodb.net:27017/social_pulse?ssl=true&replicaSet=atlas-qsgpcj-shard-0&authSource=admin&retryWrites=true&w=majority';

const liveReviews = [
  { id: 'gr-live-1', author: 'Tilkesh Soni', rating: 5, text: 'Best experience ever!', time: new Date(1782881270 * 1000).toISOString(), relativeTime: '2 months ago' },
  { id: 'gr-live-2', author: 'Alok Rai', rating: 5, text: 'One of the best company where i visited,, ultimate services ☺️', time: new Date(1738943973 * 1000).toISOString(), relativeTime: 'a year ago' },
  { id: 'gr-live-3', author: 'Chetan Yadav', rating: 5, text: 'Genuinely best for consultation and construction', time: new Date(1677436526 * 1000).toISOString(), relativeTime: '3 years ago' },
  { id: 'gr-live-4', author: 'Chandra Sharma', rating: 5, text: 'Beautiful Palace', time: new Date(1729585921 * 1000).toISOString(), relativeTime: 'a year ago' },
  { id: 'gr-live-5', author: 'CHIKU BAIRWAL', rating: 4, text: 'Best in the town', time: new Date(1698720292 * 1000).toISOString(), relativeTime: '2 years ago' }
];

async function updateDb() {
  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('weekentries');
  const res = await collection.updateMany(
    {},
    {
      $set: {
        'google.averageRating': 4.7,
        'google.totalReviews': 10,
        'google.fiveStars': 8,
        'google.fourStars': 2,
        'google.threeStars': 0,
        'google.twoStars': 0,
        'google.oneStar': 0,
        'google.recentReviews': liveReviews
      }
    }
  );
  console.log('Successfully updated MongoDB docs count:', res.modifiedCount);
  const docs = await collection.find({}).toArray();
  docs.forEach(d => console.log(d.weekId, '-> Rating:', d.google?.averageRating, 'Reviews:', d.google?.totalReviews));
  process.exit(0);
}

updateDb().catch(console.error);

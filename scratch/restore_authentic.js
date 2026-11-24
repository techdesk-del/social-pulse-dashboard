const { MongoClient } = require('mongodb');

async function restore() {
  const uri = "mongodb://akashxofficialin_db_user:NKOavvwjTlPgLc3s@ac-oyb8u0k-shard-00-00.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-01.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-02.q2jxis4.mongodb.net:27017/social_pulse?ssl=true&replicaSet=atlas-qsgpcj-shard-0&authSource=admin&retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('social_pulse');
  const collection = db.collection('weekentries');

  await collection.updateOne(
    { weekId: '2026-08-17' },
    {
      $set: {
        'linkedin.impressions': 1240,
        'linkedin.reactions': 134,
        'linkedin.comments': 7,
        'linkedin.reposts': 3,
        'linkedin.pageViews': 115,
        'linkedin.uniqueVisitors': 52,
        'linkedin.totalFollowers': 64,
        'linkedin.newFollowers': 12,
        'linkedin.searchAppearances': 168,
      }
    }
  );

  console.log('Restored 2026-08-17 authentic values successfully!');
  await client.close();
}

restore();

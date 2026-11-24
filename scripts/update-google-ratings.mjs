import mongoose from 'mongoose';

const uri = 'mongodb://akashxofficialin_db_user:NKOavvwjTlPgLc3s@ac-oyb8u0k-shard-00-00.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-01.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-02.q2jxis4.mongodb.net:27017/social_pulse?ssl=true&replicaSet=atlas-qsgpcj-shard-0&authSource=admin&retryWrites=true&w=majority';

const liveReviews = [
  {
    id: 'gr-live-0',
    author: 'Tech Desk',
    authorUrl: 'https://www.google.com/maps/contrib/114979148003606992683/reviews',
    profilePhoto: 'https://lh3.googleusercontent.com/a-/ALV-UjVj7B1Yx4tS3fU1h8GvX1a1C4-o=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    text: '',
    time: '2026-08-30T09:00:00.000Z',
    relativeTime: 'in the last week'
  },
  {
    id: 'gr-live-1',
    author: 'Sandeep Parmar',
    authorUrl: 'https://www.google.com/maps/contrib/108342416962295627685/reviews',
    profilePhoto: 'https://lh3.googleusercontent.com/a-/ALV-UjV6z1Y8=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    text: '',
    time: '2026-08-05T12:00:00.000Z',
    relativeTime: 'a month ago'
  },
  {
    id: 'gr-live-2',
    author: 'Tilkesh Soni',
    authorUrl: 'https://www.google.com/maps/contrib/102196620152844809641/reviews',
    profilePhoto: 'https://lh3.googleusercontent.com/a-/ALV-UjXDwm9JFP5zaAxN1bOegXq5RpTjznKVBEW3dd3HLOnmPlDxZak=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    text: 'Best experience ever!',
    time: '2026-07-01T04:47:50.000Z',
    relativeTime: '2 months ago'
  },
  {
    id: 'gr-live-3',
    author: 'Interior Walas',
    authorUrl: 'https://www.google.com/maps/contrib/104347712398457291124/reviews',
    profilePhoto: 'https://lh3.googleusercontent.com/a/ACg8ocL=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    text: '',
    time: '2026-01-05T10:00:00.000Z',
    relativeTime: '8 months ago'
  },
  {
    id: 'gr-live-4',
    author: 'Alok Rai',
    authorUrl: 'https://www.google.com/maps/contrib/115930082956981422086/reviews',
    profilePhoto: 'https://lh3.googleusercontent.com/a-/ALV-UjXFJZrctzA9ewWtpg493yBMnfP82P6GVNUkkjMGuQJ1KjbLjjw=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    text: 'One of the best company where i visited,, ultimate services ☺️',
    time: '2025-02-07T15:59:33.000Z',
    relativeTime: 'a year ago'
  },
  {
    id: 'gr-live-5',
    author: 'Chandra Sharma',
    authorUrl: 'https://www.google.com/maps/contrib/107059741006920577335/reviews',
    profilePhoto: 'https://lh3.googleusercontent.com/a/ACg8ocILW7nQJGPjLvqGkJCgLHRGnfXkArUnDBzIGNlosRWyVZb7gQ=s128-c0x00000000-cc-rp-mo-ba3',
    rating: 5,
    text: 'Beautiful Palace',
    time: '2024-10-22T08:32:01.000Z',
    relativeTime: 'a year ago'
  },
  {
    id: 'gr-live-6',
    author: 'CHIKU BAIRWAL',
    authorUrl: 'https://www.google.com/maps/contrib/113739786219506035705/reviews',
    profilePhoto: 'https://lh3.googleusercontent.com/a-/ALV-UjX5NEVM2MnmE8sHwcWpXvY4GF7o1KgHrk6WvJeFoKVYe6RCMYSovQ=s128-c0x00000000-cc-rp-mo-ba4',
    rating: 4,
    text: 'Best in the town',
    time: '2023-10-31T02:44:52.000Z',
    relativeTime: '2 years ago'
  },
  {
    id: 'gr-live-7',
    author: 'Chetan Yadav',
    authorUrl: 'https://www.google.com/maps/contrib/118089343163939241756/reviews',
    profilePhoto: 'https://lh3.googleusercontent.com/a/ACg8ocKH1X3MlBSdHpoTapFuVeg_nid2q0r9KyE0wtv96tphbvYWspU=s128-c0x00000000-cc-rp-mo-ba2',
    rating: 5,
    text: 'Genuinely best for consultation and construction',
    time: '2023-02-26T18:35:26.000Z',
    relativeTime: '3 years ago'
  }
];

async function updateDb() {
  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('weekentries');
  const res = await collection.updateMany(
    {},
    {
      $set: {
        'google.averageRating': 4.7,
        'google.totalReviews': 11,
        'google.fiveStars': 9,
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
  docs.forEach(d => console.log(d.weekId, '-> Rating:', d.google?.averageRating, 'Total Reviews:', d.google?.totalReviews, 'Recent Reviews Count:', d.google?.recentReviews?.length));
  process.exit(0);
}

updateDb().catch(console.error);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb://akashxofficialin_db_user:NKOavvwjTlPgLc3s@ac-oyb8u0k-shard-00-00.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-01.q2jxis4.mongodb.net:27017,ac-oyb8u0k-shard-00-02.q2jxis4.mongodb.net:27017/social_pulse?ssl=true&replicaSet=atlas-qsgpcj-shard-0&authSource=admin&retryWrites=true&w=majority";

async function resetPass() {
  await mongoose.connect(MONGODB_URI);
  const newPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await mongoose.connection.db.collection('users').updateOne(
    { email: 'social@urbangaon.com' },
    { $set: { passwordHash: passwordHash } },
    { upsert: true }
  );

  console.log('SUCCESS: Password updated to', newPassword);
  await mongoose.disconnect();
}

resetPass().catch(err => {
  console.error(err);
  process.exit(1);
});

const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(MONGODB_URI, {
    // mongoose 6 이후는 옵션 대부분 기본값이라 생략 가능
  });

  console.log('✅ Connected to MongoDB');
}

module.exports = { connectMongo };

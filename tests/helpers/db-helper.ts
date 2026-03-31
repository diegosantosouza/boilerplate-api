import mongoose from 'mongoose';

export async function connectTestDb() {
  await mongoose.connect(process.env.MONGO_URI!);
}

export async function disconnectTestDb() {
  await mongoose.disconnect();
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

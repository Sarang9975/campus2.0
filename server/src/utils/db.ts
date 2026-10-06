import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryInstance: MongoMemoryServer | null = null;

export async function connectDB(): Promise<string> {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[db] Attempting connection to MONGODB_URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      console.log('[db] Connected successfully to configured MongoDB');
      return uri;
    } catch (err: any) {
      console.warn(`[db] Could not connect to configured MONGODB_URI (${err.message}). Falling back to in-memory instance for smooth demo...`);
    }
  }

  // Fallback to in-memory MongoDB for zero-configuration, reliable prototype experience
  try {
    console.log('[db] Spinning up in-memory MongoMemoryServer for instant zero-setup execution...');
    mongoMemoryInstance = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[db] In-memory MongoDB active and connected at: ${memoryUri}`);
    return memoryUri;
  } catch (memErr: any) {
    console.error('[db] Fatal error initializing in-memory MongoDB:', memErr);
    throw memErr;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryInstance) {
    await mongoMemoryInstance.stop();
  }
}

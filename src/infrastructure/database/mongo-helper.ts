import mongoose, { type Mongoose } from 'mongoose';
import Log from '@/shared/logger/log';
import { env } from '../../shared/config/env';

export class MongoHelper {
  private static connection: Mongoose | null = null;

  static async connect(
    uri: string = env.mongo_uri,
    debug: boolean = false
  ): Promise<void> {
    if (!MongoHelper.connection) {
      try {
        mongoose.set('debug', debug);
        MongoHelper.connection = await mongoose.connect(uri);
        Log.info('MongoDb connected successfully');
      } catch (error) {
        Log.error('MongoDb connection Error', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }
  }

  static async disconnect(): Promise<void> {
    if (MongoHelper.connection) {
      try {
        await MongoHelper.connection.disconnect();
        MongoHelper.connection = null;
        Log.debug('MongoDb disconnected');
      } catch (error) {
        Log.error('MongoDb disconnect Error', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }
  }

  static async ping(): Promise<void> {
    if (!MongoHelper.connection) {
      throw new Error('MongoDB not connected');
    }
    const db = MongoHelper.connection.connection.db;
    if (!db) {
      throw new Error('MongoDB database instance not available');
    }
    await db.admin().ping();
  }
}

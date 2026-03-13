import Redis from 'ioredis';
import { env } from '../config/env';

export class Cache {
  private static instance: Cache | null = null;
  private client: Redis;
  private namespace: string;

  private constructor(client: Redis, namespace: string) {
    this.client = client;
    this.namespace = namespace;
  }

  static async getInstance(): Promise<Cache> {
    if (this.instance) {
      return this.instance;
    }
    try {
      const client = new Redis(env.cache_url);
      await client.ping();
      process.stdout.write('Cache module initialized successfully!\n');
      this.instance = new Cache(client, 'boilerplate');
      return this.instance;
    } catch (error) {
      process.stderr.write(
        `Error initializing cache module: ${String(error)}\n`
      );
      throw error;
    }
  }

  private buildKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(this.buildKey(key));
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.set(this.buildKey(key), serialized, 'EX', ttl);
    } else {
      await this.client.set(this.buildKey(key), serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(this.buildKey(key));
  }
}

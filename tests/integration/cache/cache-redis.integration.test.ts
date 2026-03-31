import { Cache, type CacheProvider } from '@/shared/cache/cache-provider';

describe('Cache (Redis Integration)', () => {
  let cache: CacheProvider;

  beforeAll(async () => {
    Cache.reset();
    await Cache.initialize();
    cache = Cache.getInstance();
  });

  afterAll(async () => {
    await Cache.disconnect();
    Cache.reset();
  });

  it('should set and get a value', async () => {
    await cache.set('test-key', { data: 'hello' });
    const result = await cache.get<{ data: string }>('test-key');

    expect(result).toEqual({ data: 'hello' });
  });

  it('should return null for missing key', async () => {
    const result = await cache.get('nonexistent');

    expect(result).toBeNull();
  });

  it('should delete a key', async () => {
    await cache.set('delete-me', 'value');
    await cache.delete('delete-me');
    const result = await cache.get('delete-me');

    expect(result).toBeNull();
  });

  it('should use remember pattern', async () => {
    let called = 0;
    const resolver = async () => {
      called++;
      return 'resolved';
    };

    const first = await cache.remember('remember-key', resolver);
    const second = await cache.remember('remember-key', resolver);

    expect(first).toBe('resolved');
    expect(second).toBe('resolved');
    expect(called).toBe(1);
  });

  it('should respect TTL', async () => {
    await cache.set('ttl-key', 'short-lived', { ttlSeconds: 1 });
    const before = await cache.get('ttl-key');
    expect(before).toBe('short-lived');

    await new Promise(resolve => setTimeout(resolve, 1100));
    const after = await cache.get('ttl-key');
    expect(after).toBeNull();
  });
});

import Redis from 'ioredis';
import { Cache } from '@/shared/cache';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    ping: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
  }));
});

describe('Cache', () => {
  beforeEach(() => {
    Cache.reset();
    jest.clearAllMocks();
  });

  it('should fail open when redis initialization fails', async () => {
    const ping = jest.fn().mockRejectedValue(new Error('redis unavailable'));
    jest.mocked(Redis).mockImplementation(
      () =>
        ({
          ping,
        }) as any
    );

    await expect(Cache.initialize()).resolves.toBeDefined();

    const result = await Cache.getInstance().remember(
      'items:test',
      async () => 'fallback'
    );

    expect(result).toBe('fallback');
  });

  it('should initialize redis cache when redis is available', async () => {
    const ping = jest.fn().mockResolvedValue('PONG');
    const get = jest.fn().mockResolvedValue(null);
    const set = jest.fn().mockResolvedValue('OK');
    jest.mocked(Redis).mockImplementation(
      () =>
        ({
          ping,
          get,
          set,
          del: jest.fn(),
          incr: jest.fn(),
        }) as any
    );

    await Cache.initialize();
    await Cache.getInstance().set('test-key', { ok: true });

    expect(ping).toHaveBeenCalled();
    expect(set).toHaveBeenCalled();
  });
});

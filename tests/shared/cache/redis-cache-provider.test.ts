import { randomUUID } from 'node:crypto';
import { RedisCacheProvider } from '@/shared/cache';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('RedisCacheProvider', () => {
  const mockedRandomUUID = jest.mocked(randomUUID);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create and reuse a namespace token when it does not exist yet', async () => {
    const client = {
      ping: jest.fn(),
      get: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(JSON.stringify({ ok: true })),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn(),
    };

    mockedRandomUUID.mockReturnValue(
      'token-1234' as `${string}-${string}-${string}-${string}-${string}`
    );

    const provider = new RedisCacheProvider(client as any, {
      keyPrefix: 'boilerplate',
      defaultTtlSeconds: 60,
    });

    const result = await provider.get('show:item-1', {
      namespace: 'items',
    });

    expect(client.set).toHaveBeenNthCalledWith(
      1,
      'boilerplate:namespace:items:token',
      'token1234',
      'NX'
    );
    expect(client.get).toHaveBeenNthCalledWith(
      2,
      'boilerplate:items:t_token1234:show:item-1'
    );
    expect(result).toEqual({ ok: true });
  });

  it('should overwrite the namespace token during invalidation', async () => {
    const client = {
      ping: jest.fn(),
      get: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn(),
    };

    mockedRandomUUID.mockReturnValue(
      'token-5678' as `${string}-${string}-${string}-${string}-${string}`
    );

    const provider = new RedisCacheProvider(client as any, {
      keyPrefix: 'boilerplate',
      defaultTtlSeconds: 60,
    });

    await provider.refreshNamespaceToken('items');

    expect(client.set).toHaveBeenCalledWith(
      'boilerplate:namespace:items:token',
      'token5678'
    );
  });
});

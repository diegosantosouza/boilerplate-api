import { CacheProvider } from '@/shared/cache';
import { NotFoundError } from '@/shared/errors';
import { ItemShowUseCase } from '@/modules/items/usecases';
import { ItemRepository } from '@/modules/items/repositories';

describe('ItemShowUseCase', () => {
  let usecase: ItemShowUseCase;
  let mockRepository: jest.Mocked<ItemRepository>;
  let mockCacheProvider: jest.Mocked<CacheProvider>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
    } as any;

    mockCacheProvider = {
      initialize: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      remember: jest.fn(),
      refreshNamespaceToken: jest.fn(),
      getNamespaceToken: jest.fn(),
    };

    usecase = new ItemShowUseCase(mockRepository, mockCacheProvider);
  });

  it('should resolve item show through the cache provider', async () => {
    const expectedOutput = {
      id: 'item-1',
      name: 'Chair',
    };

    mockCacheProvider.remember.mockImplementation(async (_key, resolver) =>
      resolver()
    );
    mockRepository.findById.mockResolvedValue(expectedOutput as any);

    const result = await usecase.execute({ id: 'item-1' });

    expect(mockCacheProvider.remember).toHaveBeenCalledWith(
      'show:item-1',
      expect.any(Function),
      {
        namespace: 'items',
      }
    );
    expect(mockRepository.findById).toHaveBeenCalledWith('item-1');
    expect(result).toEqual(expectedOutput);
  });

  it('should throw when the item does not exist', async () => {
    mockCacheProvider.remember.mockImplementation(async (_key, resolver) =>
      resolver()
    );
    mockRepository.findById.mockResolvedValue(null);

    await expect(usecase.execute({ id: 'missing-item' })).rejects.toThrow(
      NotFoundError
    );
  });
});

import { CacheProvider } from '@/shared/cache';
import { ItemDeleteUseCase } from '@/modules/items/usecases';
import { ItemRepository } from '@/modules/items/repositories';

describe('ItemDeleteUseCase', () => {
  let usecase: ItemDeleteUseCase;
  let mockRepository: jest.Mocked<ItemRepository>;
  let mockCacheProvider: jest.Mocked<CacheProvider>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
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

    usecase = new ItemDeleteUseCase(mockRepository, mockCacheProvider);
  });

  it('should invalidate the items namespace after a successful delete', async () => {
    mockRepository.findById.mockResolvedValue({ id: 'item-1' } as any);
    mockRepository.delete.mockResolvedValue(true);

    const result = await usecase.execute({ id: 'item-1' });

    expect(mockRepository.delete).toHaveBeenCalledWith('item-1');
    expect(mockCacheProvider.refreshNamespaceToken).toHaveBeenCalledWith('items');
    expect(result).toBe(true);
  });
});

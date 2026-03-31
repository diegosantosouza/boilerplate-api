import type { ItemRepository } from '@/modules/items/repositories';
import { ItemDeleteUseCase } from '@/modules/items/usecases';
import type { CacheProvider } from '@/shared/cache';

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

  it('should delete an item and invalidate cache', async () => {
    mockRepository.findById.mockResolvedValue({ id: 'item-1' } as any);
    mockRepository.delete.mockResolvedValue(true);

    const result = await usecase.execute({ id: 'item-1' });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalledWith('item-1');
    expect(mockCacheProvider.refreshNamespaceToken).toHaveBeenCalledWith(
      'items'
    );
  });

  it('should return NOT_FOUND error when item does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await usecase.execute({ id: 'missing' });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().type).toBe('NOT_FOUND');
  });

  it('should return INTERNAL error when delete operation fails', async () => {
    mockRepository.findById.mockResolvedValue({ id: 'item-1' } as any);
    mockRepository.delete.mockResolvedValue(false);

    const result = await usecase.execute({ id: 'item-1' });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().type).toBe('INTERNAL');
  });
});

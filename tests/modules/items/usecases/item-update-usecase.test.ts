import type { ItemRepository } from '@/modules/items/repositories';
import { ItemUpdateUseCase } from '@/modules/items/usecases';
import type { CacheProvider } from '@/shared/cache';

describe('ItemUpdateUseCase', () => {
  let usecase: ItemUpdateUseCase;
  let mockRepository: jest.Mocked<ItemRepository>;
  let mockCacheProvider: jest.Mocked<CacheProvider>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
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

    usecase = new ItemUpdateUseCase(mockRepository, mockCacheProvider);
  });

  it('should update an item and invalidate cache', async () => {
    const input = {
      id: 'item-1',
      name: 'Updated chair',
    };
    const updatedItem = {
      id: 'item-1',
      name: 'Updated chair',
    };

    mockRepository.findById.mockResolvedValue({ id: 'item-1' } as any);
    mockRepository.update.mockResolvedValue(updatedItem as any);

    const result = await usecase.execute(input as any);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(updatedItem);
    expect(mockRepository.update).toHaveBeenCalledWith('item-1', input);
    expect(mockCacheProvider.refreshNamespaceToken).toHaveBeenCalledWith(
      'items'
    );
  });

  it('should return NOT_FOUND error when item does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await usecase.execute({ id: 'missing' } as any);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().type).toBe('NOT_FOUND');
  });

  it('should return INTERNAL error when update operation fails', async () => {
    mockRepository.findById.mockResolvedValue({ id: 'item-1' } as any);
    mockRepository.update.mockResolvedValue(null);

    const result = await usecase.execute({ id: 'item-1', name: 'test' } as any);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().type).toBe('INTERNAL');
  });
});

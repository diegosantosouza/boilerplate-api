import { CacheProvider } from '@/shared/cache';
import { ItemUpdateUseCase } from '@/modules/items/usecases';
import { ItemRepository } from '@/modules/items/repositories';

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

  it('should invalidate the items namespace after a successful update', async () => {
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

    expect(mockRepository.update).toHaveBeenCalledWith('item-1', input);
    expect(mockCacheProvider.refreshNamespaceToken).toHaveBeenCalledWith('items');
    expect(result).toEqual(updatedItem);
  });
});

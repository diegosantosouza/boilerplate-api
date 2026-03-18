import { CacheProvider } from '@/shared/cache';
import { ItemListUseCase } from '@/modules/items/usecases';
import { ItemRepository } from '@/modules/items/repositories';

describe('ItemListUseCase', () => {
  let usecase: ItemListUseCase;
  let mockRepository: jest.Mocked<ItemRepository>;
  let mockCacheProvider: jest.Mocked<CacheProvider>;

  beforeEach(() => {
    mockRepository = {
      paginate: jest.fn(),
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

    usecase = new ItemListUseCase(mockRepository, mockCacheProvider);
  });

  it('should resolve list results through the cache provider', async () => {
    const input = {
      page: 1,
      limit: 10,
      name: 'chair',
      active: true,
    };
    const expectedOutput = {
      docs: [],
      totalDocs: 0,
      limit: 10,
      page: 1,
      totalPages: 0,
    };

    mockCacheProvider.remember.mockImplementation(async (_key, resolver) =>
      resolver()
    );
    mockRepository.paginate.mockResolvedValue(expectedOutput as any);

    const result = await usecase.execute(input as any);

    expect(mockCacheProvider.remember).toHaveBeenCalledWith(
      expect.stringContaining('list:'),
      expect.any(Function),
      {
        namespace: 'items',
      }
    );
    expect(mockRepository.paginate).toHaveBeenCalledWith(input);
    expect(result).toEqual(expectedOutput);
  });
});

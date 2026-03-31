import type { ItemRepository } from '@/modules/items/repositories';
import { ItemCreateUseCase } from '@/modules/items/usecases';
import type { CacheProvider } from '@/shared/cache';

describe('ItemCreateUseCase', () => {
  let usecase: ItemCreateUseCase;
  let mockRepository: jest.Mocked<ItemRepository>;
  let mockCacheProvider: jest.Mocked<CacheProvider>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
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
    usecase = new ItemCreateUseCase(mockRepository, mockCacheProvider);
  });

  it('should create an item successfully', async () => {
    const input = {
      name: 'Test Item',
      description: 'A test item description',
      price: 99.9,
      active: true,
      category: 'electronics',
    };

    const expectedOutput = {
      ...input,
      id: '64e88c28184da39eefcf1d5b',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.create.mockResolvedValue(expectedOutput as any);

    const result = await usecase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(expectedOutput);
    expect(mockRepository.create).toHaveBeenCalledWith(input);
    expect(mockCacheProvider.refreshNamespaceToken).toHaveBeenCalledWith(
      'items'
    );
  });

  it('should create an item with default active=true', async () => {
    const input = {
      name: 'Another Item',
      description: 'Another description',
      price: 50,
      active: true,
      category: 'books',
    };

    mockRepository.create.mockResolvedValue({ ...input, id: '123' } as any);

    const result = await usecase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockRepository.create).toHaveBeenCalledWith(input);
    expect(mockCacheProvider.refreshNamespaceToken).toHaveBeenCalledWith(
      'items'
    );
  });
});

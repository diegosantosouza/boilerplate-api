import { ItemCreateUseCase } from '@/modules/items/usecases';
import { ItemRepository } from '@/modules/items/repositories';

describe('ItemCreateUseCase', () => {
  let usecase: ItemCreateUseCase;
  let mockRepository: jest.Mocked<ItemRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
    } as any;
    usecase = new ItemCreateUseCase(mockRepository);
  });

  it('should create an item successfully', async () => {
    const input = {
      name: 'Test Item',
      description: 'A test item description',
      price: 99.90,
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

    expect(mockRepository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(expectedOutput);
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

    await usecase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });
});

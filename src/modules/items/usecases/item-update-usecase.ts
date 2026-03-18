import { CacheProvider } from '@/shared/cache';
import { NotFoundError, ServerError } from '@/shared/errors';
import { ItemIdInput, ItemUpdateInput, ItemUpdateOutput } from '../dto';
import { ItemRepository } from '../repositories';
import { ITEMS_CACHE_NAMESPACE } from '../constants/cache';

export class ItemUpdateUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ItemUpdateUseCase.Input
  ): Promise<ItemUpdateUseCase.Output> {
    const itemExists = await this.itemRepository.findById(input.id);
    if (!itemExists) {
      throw new NotFoundError('Item not found');
    }

    const item = await this.itemRepository.update(input.id, input);
    if (!item) {
      throw new ServerError('Failed to update item');
    }

    await this.cacheProvider.refreshNamespaceToken(ITEMS_CACHE_NAMESPACE);
    return item;
  }
}

export namespace ItemUpdateUseCase {
  export type Input = ItemUpdateInput & ItemIdInput;
  export type Output = ItemUpdateOutput;
}

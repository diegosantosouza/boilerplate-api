import { CacheProvider } from '@/shared/cache';
import { NotFoundError } from '@/shared/errors';
import { ItemShowInput, ItemShowOutput } from '../dto';
import { ItemRepository } from '../repositories';
import {
  buildItemShowCacheKey,
  ITEMS_CACHE_NAMESPACE,
} from '../constants/cache';

export class ItemShowUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(input: ItemShowUseCase.Input): Promise<ItemShowUseCase.Output> {
    return this.cacheProvider.remember(
      buildItemShowCacheKey(input.id),
      async () => {
        const item = await this.itemRepository.findById(input.id);
        if (!item) {
          throw new NotFoundError('Item not found');
        }
        return item;
      },
      {
        namespace: ITEMS_CACHE_NAMESPACE,
      }
    );
  }
}

export namespace ItemShowUseCase {
  export type Input = ItemShowInput;
  export type Output = ItemShowOutput;
}

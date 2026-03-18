import { CacheProvider } from '@/shared/cache';
import { ItemsListInput, ItemsListOutput } from '../dto';
import { ItemRepository } from '../repositories';
import {
  buildItemListCacheKey,
  ITEMS_CACHE_NAMESPACE,
} from '../constants/cache';

export class ItemListUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(input: ItemListUseCase.Input): Promise<ItemListUseCase.Output> {
    return this.cacheProvider.remember(
      buildItemListCacheKey(input),
      () => this.itemRepository.paginate(input),
      {
        namespace: ITEMS_CACHE_NAMESPACE,
      }
    );
  }
}

export namespace ItemListUseCase {
  export type Input = ItemsListInput;
  export type Output = ItemsListOutput;
}

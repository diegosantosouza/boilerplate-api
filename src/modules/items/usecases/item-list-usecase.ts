import { ok } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import type { DomainResult } from '@/shared/protocols/result';
import {
  buildItemListCacheKey,
  ITEMS_CACHE_NAMESPACE,
} from '../constants/cache';
import type { ItemsListInput, ItemsListOutput } from '../dto';
import type { ItemRepository } from '../repositories';

export class ItemListUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ItemListUseCase.Input
  ): Promise<DomainResult<ItemListUseCase.Output>> {
    const result = await this.cacheProvider.remember(
      buildItemListCacheKey(input),
      () => this.itemRepository.paginate(input),
      { namespace: ITEMS_CACHE_NAMESPACE }
    );
    return ok(result);
  }
}

export namespace ItemListUseCase {
  export type Input = ItemsListInput;
  export type Output = ItemsListOutput;
}

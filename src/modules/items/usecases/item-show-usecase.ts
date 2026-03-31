import { err, ok } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import type { DomainResult } from '@/shared/protocols/result';
import {
  buildItemShowCacheKey,
  ITEMS_CACHE_NAMESPACE,
} from '../constants/cache';
import type { ItemShowInput, ItemShowOutput } from '../dto';
import type { ItemRepository } from '../repositories';

export class ItemShowUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ItemShowUseCase.Input
  ): Promise<DomainResult<ItemShowUseCase.Output>> {
    const item = await this.cacheProvider.remember(
      buildItemShowCacheKey(input.id),
      async () => this.itemRepository.findById(input.id),
      { namespace: ITEMS_CACHE_NAMESPACE }
    );

    if (!item) {
      return err({
        type: 'NOT_FOUND',
        message: 'Item not found',
        resource: 'Item',
      });
    }

    return ok(item);
  }
}

export namespace ItemShowUseCase {
  export type Input = ItemShowInput;
  export type Output = ItemShowOutput;
}

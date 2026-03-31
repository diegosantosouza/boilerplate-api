import { ok } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import { eventBus } from '@/shared/events';
import type { DomainResult } from '@/shared/protocols/result';
import { ITEMS_CACHE_NAMESPACE } from '../constants/cache';
import type { ItemCreateInput, ItemCreateOutput } from '../dto';
import { ItemEvents } from '../events/item-events';
import type { ItemRepository } from '../repositories';

export class ItemCreateUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ItemCreateUseCase.Input
  ): Promise<DomainResult<ItemCreateUseCase.Output>> {
    const item = await this.itemRepository.create(input);
    await this.cacheProvider.refreshNamespaceToken(ITEMS_CACHE_NAMESPACE);
    eventBus.publish({
      name: ItemEvents.CREATED,
      payload: item,
      occurredAt: new Date(),
    });
    return ok(item);
  }
}

export namespace ItemCreateUseCase {
  export type Input = ItemCreateInput;
  export type Output = ItemCreateOutput;
}

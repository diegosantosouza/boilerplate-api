import { err, ok } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import { eventBus } from '@/shared/events';
import type { DomainResult } from '@/shared/protocols/result';
import { ITEMS_CACHE_NAMESPACE } from '../constants/cache';
import type { ItemIdInput, ItemUpdateInput, ItemUpdateOutput } from '../dto';
import { ItemEvents } from '../events/item-events';
import type { ItemRepository } from '../repositories';

export class ItemUpdateUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ItemUpdateUseCase.Input
  ): Promise<DomainResult<ItemUpdateUseCase.Output>> {
    const itemExists = await this.itemRepository.findById(input.id);
    if (!itemExists) {
      return err({
        type: 'NOT_FOUND',
        message: 'Item not found',
        resource: 'Item',
      });
    }

    const item = await this.itemRepository.update(input.id, input);
    if (!item) {
      return err({
        type: 'INTERNAL',
        message: 'Failed to update item',
      });
    }

    await this.cacheProvider.refreshNamespaceToken(ITEMS_CACHE_NAMESPACE);
    eventBus.publish({
      name: ItemEvents.UPDATED,
      payload: item,
      occurredAt: new Date(),
    });
    return ok(item);
  }
}

export namespace ItemUpdateUseCase {
  export type Input = ItemUpdateInput & ItemIdInput;
  export type Output = ItemUpdateOutput;
}

import { err, ok } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import { eventBus } from '@/shared/events';
import type { DomainResult } from '@/shared/protocols/result';
import { ITEMS_CACHE_NAMESPACE } from '../constants/cache';
import type { ItemDeleteInput, ItemDeleteOutput } from '../dto';
import { ItemEvents } from '../events/item-events';
import type { ItemRepository } from '../repositories';

export class ItemDeleteUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ItemDeleteUseCase.Input
  ): Promise<DomainResult<ItemDeleteUseCase.Output>> {
    const itemExists = await this.itemRepository.findById(input.id);
    if (!itemExists) {
      return err({
        type: 'NOT_FOUND',
        message: 'Item not found',
        resource: 'Item',
      });
    }

    const deleted = await this.itemRepository.delete(input.id);
    if (!deleted) {
      return err({
        type: 'INTERNAL',
        message: 'Failed to delete Item',
      });
    }

    await this.cacheProvider.refreshNamespaceToken(ITEMS_CACHE_NAMESPACE);
    eventBus.publish({
      name: ItemEvents.DELETED,
      payload: { id: input.id },
      occurredAt: new Date(),
    });
    return ok(true);
  }
}

export namespace ItemDeleteUseCase {
  export type Input = ItemDeleteInput;
  export type Output = ItemDeleteOutput;
}

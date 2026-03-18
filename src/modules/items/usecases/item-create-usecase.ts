import { CacheProvider } from '@/shared/cache';
import { ItemRepository } from '../repositories';
import { ItemCreateInput, ItemCreateOutput } from '../dto';
import { ITEMS_CACHE_NAMESPACE } from '../constants/cache';

export class ItemCreateUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ItemCreateUseCase.Input
  ): Promise<ItemCreateUseCase.Output> {
    const item = await this.itemRepository.create(input);
    await this.cacheProvider.refreshNamespaceToken(ITEMS_CACHE_NAMESPACE);
    return item;
  }
}

export namespace ItemCreateUseCase {
  export type Input = ItemCreateInput;
  export type Output = ItemCreateOutput;
}

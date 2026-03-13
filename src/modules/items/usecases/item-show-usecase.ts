import { NotFoundError } from '@/shared/errors';
import { ItemShowInput, ItemShowOutput } from '../dto';
import { ItemRepository } from '../repositories';

export class ItemShowUseCase {
  constructor(private readonly itemRepository: ItemRepository) { }

  async execute(input: ItemShowUseCase.Input): Promise<ItemShowUseCase.Output> {
    const item = await this.itemRepository.findById(input.id);
    if (!item) {
      throw new NotFoundError('Item not found');
    }
    return item;
  }
}

export namespace ItemShowUseCase {
  export type Input = ItemShowInput;
  export type Output = ItemShowOutput;
}

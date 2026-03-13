import { NotFoundError, ServerError } from '@/shared/errors';
import { ItemIdInput, ItemUpdateInput, ItemUpdateOutput } from '../dto';
import { ItemRepository } from '../repositories';

export class ItemUpdateUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

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
    return item;
  }
}

export namespace ItemUpdateUseCase {
  export type Input = ItemUpdateInput & ItemIdInput;
  export type Output = ItemUpdateOutput;
}

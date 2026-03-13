import { NotFoundError, ServerError } from '@/shared/errors';
import { ItemDeleteInput, ItemDeleteOutput } from '../dto';
import { ItemRepository } from '../repositories';

export class ItemDeleteUseCase {
  constructor(private readonly itemRepository: ItemRepository) { }

  async execute(input: ItemDeleteUseCase.Input): Promise<ItemDeleteUseCase.Output> {
    const itemExists = await this.itemRepository.findById(input.id);
    if (!itemExists) {
      throw new NotFoundError('Item not found')
    }

    const item = await this.itemRepository.delete(input.id);
    if (!item) {
      throw new ServerError('Failed to delete Item')
    }
    return true;
  }
}

export namespace ItemDeleteUseCase {
  export type Input = ItemDeleteInput;
  export type Output = ItemDeleteOutput;
}

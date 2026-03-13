import { ItemRepository } from '../repositories';
import { ItemCreateInput, ItemCreateOutput } from '../dto';

export class ItemCreateUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute(
    input: ItemCreateUseCase.Input
  ): Promise<ItemCreateUseCase.Output> {
    return this.itemRepository.create(input);
  }
}

export namespace ItemCreateUseCase {
  export type Input = ItemCreateInput;
  export type Output = ItemCreateOutput;
}

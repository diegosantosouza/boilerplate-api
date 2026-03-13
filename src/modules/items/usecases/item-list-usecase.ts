import { ItemsListInput, ItemsListOutput } from '../dto';
import { ItemRepository } from '../repositories';

export class ItemListUseCase {
  constructor(private readonly itemRepository: ItemRepository) { }

  async execute(input: ItemListUseCase.Input): Promise<ItemListUseCase.Output> {
    return await this.itemRepository.paginate(input);
  }
}

export namespace ItemListUseCase {
  export type Input = ItemsListInput;
  export type Output = ItemsListOutput;
}

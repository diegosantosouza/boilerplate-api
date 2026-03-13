import { ItemListHttpController } from '../controllers';
import { ItemListUseCase } from '../usecases';
import { ItemRepository } from '../repositories';

export const makeItemListController = (): ItemListHttpController => {
  const itemRepository = new ItemRepository();
  const itemListUseCase = new ItemListUseCase(itemRepository);
  return new ItemListHttpController(itemListUseCase);
};

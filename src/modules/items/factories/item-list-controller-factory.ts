import { Cache } from '@/shared/cache';
import { ItemListHttpController } from '../controllers';
import { ItemListUseCase } from '../usecases';
import { ItemRepository } from '../repositories';

export const makeItemListController = (): ItemListHttpController => {
  const itemRepository = new ItemRepository();
  const itemListUseCase = new ItemListUseCase(itemRepository, Cache.getInstance());
  return new ItemListHttpController(itemListUseCase);
};

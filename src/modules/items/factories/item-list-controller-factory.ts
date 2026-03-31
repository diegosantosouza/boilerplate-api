import { Cache } from '@/shared/cache';
import { ItemListHttpController } from '../controllers';
import { ItemRepository } from '../repositories';
import { ItemListUseCase } from '../usecases';

export const makeItemListController = (): ItemListHttpController => {
  const itemRepository = new ItemRepository();
  const itemListUseCase = new ItemListUseCase(
    itemRepository,
    Cache.getInstance()
  );
  return new ItemListHttpController(itemListUseCase);
};

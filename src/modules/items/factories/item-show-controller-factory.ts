import { Cache } from '@/shared/cache';
import { ItemShowHttpController } from '../controllers';
import { ItemRepository } from '../repositories';
import { ItemShowUseCase } from '../usecases';

export const makeItemShowController = (): ItemShowHttpController => {
  const itemRepository = new ItemRepository();
  const itemShowUseCase = new ItemShowUseCase(
    itemRepository,
    Cache.getInstance()
  );
  return new ItemShowHttpController(itemShowUseCase);
};

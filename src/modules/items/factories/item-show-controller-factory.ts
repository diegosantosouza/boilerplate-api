import { Cache } from '@/shared/cache';
import { ItemRepository } from '../repositories';
import { ItemShowUseCase } from '../usecases';
import { ItemShowHttpController } from '../controllers';

export const makeItemShowController = (): ItemShowHttpController => {
  const itemRepository = new ItemRepository();
  const itemShowUseCase = new ItemShowUseCase(itemRepository, Cache.getInstance());
  return new ItemShowHttpController(itemShowUseCase);
};

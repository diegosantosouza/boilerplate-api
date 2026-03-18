import { Cache } from '@/shared/cache';
import { ItemDeleteHttpController } from '../controllers';
import { ItemRepository } from '../repositories';
import { ItemDeleteUseCase } from '../usecases';

export const makeItemDeleteController = (): ItemDeleteHttpController => {
  const itemRepository = new ItemRepository();
  const itemDeleteUseCase = new ItemDeleteUseCase(
    itemRepository,
    Cache.getInstance()
  );
  return new ItemDeleteHttpController(itemDeleteUseCase);
};

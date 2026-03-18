import { Cache } from '@/shared/cache';
import { ItemUpdateHttpController } from '../controllers';
import { ItemRepository } from '../repositories';
import { ItemUpdateUseCase } from '../usecases';

export const makeItemUpdateController = (): ItemUpdateHttpController => {
  const itemRepository = new ItemRepository();
  const itemUpdateUseCase = new ItemUpdateUseCase(
    itemRepository,
    Cache.getInstance()
  );
  return new ItemUpdateHttpController(itemUpdateUseCase);
};

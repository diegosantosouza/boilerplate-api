import { ItemDeleteHttpController } from '../controllers';
import { ItemRepository } from '../repositories';
import { ItemDeleteUseCase } from '../usecases';

export const makeItemDeleteController = (): ItemDeleteHttpController => {
  const itemRepository = new ItemRepository();
  const itemDeleteUseCase = new ItemDeleteUseCase(itemRepository);
  return new ItemDeleteHttpController(itemDeleteUseCase);
};

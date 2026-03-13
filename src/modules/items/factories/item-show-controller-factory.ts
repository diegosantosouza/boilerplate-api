import { ItemRepository } from '../repositories';
import { ItemShowUseCase } from '../usecases';
import { ItemShowHttpController } from '../controllers';

export const makeItemShowController = (): ItemShowHttpController => {
  const itemRepository = new ItemRepository();
  const itemShowUseCase = new ItemShowUseCase(itemRepository);
  return new ItemShowHttpController(itemShowUseCase);
};

import { ItemCreateHttpController } from '../controllers';
import { ItemRepository } from '../repositories';
import { ItemCreateUseCase } from '../usecases';

export const makeItemCreateController = (): ItemCreateHttpController => {
  const itemRepository = new ItemRepository();
  const itemCreateUseCase = new ItemCreateUseCase(itemRepository);
  return new ItemCreateHttpController(itemCreateUseCase);
};

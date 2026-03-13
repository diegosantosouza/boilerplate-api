import { BaseRepository } from '@/shared/repository/repository';
import { BaseModel } from '@/shared/models/base-model';
import { ItemInterface, ItemSchema } from '../schemas';
import { Item } from '../entities';
import { ItemsListInput } from '../dto';
import { PaginateResult } from 'mongoose';

export class ItemRepository extends BaseRepository<
  ItemInterface,
  Omit<Item, keyof BaseModel>
> {
  constructor() {
    super(ItemSchema);
  }

  async paginate(
    input: ItemsListInput
  ): Promise<PaginateResult<ItemInterface>> {
    const criteria: { [key: string]: unknown } = {};

    if (input.name) {
      criteria.name = { $regex: input.name, $options: 'i' };
    }

    if (input.active !== undefined) {
      criteria.active = input.active;
    }

    if (input.category) {
      criteria.category = { $regex: input.category, $options: 'i' };
    }

    const result = await ItemSchema.paginate(criteria, {
      page: input.page,
      limit: input.limit,
      sort: '-createdAt',
    });

    return result;
  }
}

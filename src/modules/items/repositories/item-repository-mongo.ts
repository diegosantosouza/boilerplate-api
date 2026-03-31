import type { PaginateResult } from 'mongoose';
import type { BaseModel } from '@/shared/models/base-model';
import { BaseRepository } from '@/shared/repository/repository';
import type { ItemsListInput } from '../dto';
import type { Item } from '../entities';
import { type ItemInterface, ItemSchema } from '../schemas';

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

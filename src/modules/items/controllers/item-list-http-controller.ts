import { Request } from 'express';
import { HttpResponse } from '@/shared/protocols/http';
import { ok } from '@/shared/helpers';
import { ItemsListInputSchema } from '../dto';
import { ItemListUseCase } from '../usecases';

export class ItemListHttpController {
  constructor(private readonly itemListUseCase: ItemListUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ItemsListInputSchema.parse(req.query);
    const result = await this.itemListUseCase.execute(parsed);

    const response = {
      items: result.docs,
      limit: result.limit,
      page: result.page,
      totalItems: result.totalDocs,
      totalPages: result.totalPages,
      nextPage: result.hasNextPage ? (result.page || 1) + 1 : null,
      prevPage: result.hasPrevPage ? (result.page || 1) - 1 : null,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };

    return ok(response);
  }
}

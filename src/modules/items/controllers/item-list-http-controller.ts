import type { Request } from 'express';
import { domainErrorToResponse, ok } from '@/shared/helpers';
import type { HttpResponse } from '@/shared/protocols/http';
import { ItemsListInputSchema } from '../dto';
import type { ItemListUseCase } from '../usecases';

export class ItemListHttpController {
  constructor(private readonly itemListUseCase: ItemListUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ItemsListInputSchema.parse(req.query);
    const result = await this.itemListUseCase.execute(parsed);

    return result.match(
      paginateResult =>
        ok({
          items: paginateResult.docs,
          limit: paginateResult.limit,
          page: paginateResult.page,
          totalItems: paginateResult.totalDocs,
          totalPages: paginateResult.totalPages,
          nextPage: paginateResult.hasNextPage
            ? (paginateResult.page || 1) + 1
            : null,
          prevPage: paginateResult.hasPrevPage
            ? (paginateResult.page || 1) - 1
            : null,
          hasNextPage: paginateResult.hasNextPage,
          hasPrevPage: paginateResult.hasPrevPage,
        }),
      error => domainErrorToResponse(error)
    );
  }
}

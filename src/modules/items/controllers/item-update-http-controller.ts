import type { Request } from 'express';
import { domainErrorToResponse, ok } from '@/shared/helpers';
import type { HttpResponse } from '@/shared/protocols/http';
import { ItemIdSchema, ItemUpdateInputSchema } from '../dto';
import type { ItemUpdateUseCase } from '../usecases';

export class ItemUpdateHttpController {
  constructor(private readonly itemUpdateUseCase: ItemUpdateUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const idParsed = ItemIdSchema.parse(req.params);
    const parsed = ItemUpdateInputSchema.parse(req.body);
    const result = await this.itemUpdateUseCase.execute({
      ...parsed,
      id: idParsed.id,
    });

    return result.match(
      item => ok(item),
      error => domainErrorToResponse(error)
    );
  }
}

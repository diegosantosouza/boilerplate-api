import type { Request } from 'express';
import { domainErrorToResponse, ok } from '@/shared/helpers';
import type { HttpResponse } from '@/shared/protocols/http';
import { ItemIdSchema } from '../dto';
import type { ItemShowUseCase } from '../usecases';

export class ItemShowHttpController {
  constructor(private readonly itemShowUseCase: ItemShowUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ItemIdSchema.parse(req.params);
    const result = await this.itemShowUseCase.execute(parsed);

    return result.match(
      item => ok(item),
      error => domainErrorToResponse(error)
    );
  }
}

import type { Request } from 'express';
import { domainErrorToResponse, noContent } from '@/shared/helpers';
import type { HttpResponse } from '@/shared/protocols/http';
import { ItemIdSchema } from '../dto';
import type { ItemDeleteUseCase } from '../usecases';

export class ItemDeleteHttpController {
  constructor(private readonly itemDeleteUseCase: ItemDeleteUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const idParsed = ItemIdSchema.parse(req.params);
    const result = await this.itemDeleteUseCase.execute(idParsed);

    return result.match(
      () => noContent(),
      error => domainErrorToResponse(error)
    );
  }
}

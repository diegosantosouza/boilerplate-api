import type { Request } from 'express';
import { created, domainErrorToResponse } from '@/shared/helpers';
import type { HttpResponse } from '@/shared/protocols/http';
import { ItemCreateInputSchema } from '../dto';
import type { ItemCreateUseCase } from '../usecases';

export class ItemCreateHttpController {
  constructor(private readonly itemCreateUseCase: ItemCreateUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ItemCreateInputSchema.parse(req.body);
    const result = await this.itemCreateUseCase.execute(parsed);

    return result.match(
      item => created(item),
      error => domainErrorToResponse(error)
    );
  }
}

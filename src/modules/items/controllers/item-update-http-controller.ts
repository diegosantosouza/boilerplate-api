import { Request } from 'express';
import { HttpResponse } from '@/shared/protocols/http';
import { ok } from '@/shared/helpers';
import { ItemIdSchema, ItemUpdateInputSchema } from '../dto';
import { ItemUpdateUseCase } from '../usecases';

export class ItemUpdateHttpController {
  constructor(private readonly itemUpdateUseCase: ItemUpdateUseCase) { }

  async handle(req: Request): Promise<HttpResponse> {
    const idParsed = ItemIdSchema.parse(req.params);
    const parsed = ItemUpdateInputSchema.parse(req.body);
    const item = await this.itemUpdateUseCase.execute({ ...parsed, id: idParsed.id });
    return ok(item);
  }
}

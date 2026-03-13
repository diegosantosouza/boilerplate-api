import { Request } from 'express';
import { HttpResponse } from '@/shared/protocols/http';
import { ok } from '@/shared/helpers';
import { ItemShowUseCase } from '../usecases';
import { ItemIdSchema } from '../dto';

export class ItemShowHttpController {
  constructor(private readonly itemShowUseCase: ItemShowUseCase) { }

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ItemIdSchema.parse(req.params);
    const item = await this.itemShowUseCase.execute(parsed);
    return ok(item);
  }
}

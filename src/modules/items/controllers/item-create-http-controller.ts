import { Request } from 'express';
import { HttpResponse } from '@/shared/protocols/http';
import { created } from '@/shared/helpers';
import { ItemCreateUseCase } from '../usecases';
import { ItemCreateInputSchema } from '../dto';

export class ItemCreateHttpController {
  constructor(private readonly itemCreateUseCase: ItemCreateUseCase) { }

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ItemCreateInputSchema.parse(req.body);
    const item = await this.itemCreateUseCase.execute(parsed);
    return created(item);
  }
}

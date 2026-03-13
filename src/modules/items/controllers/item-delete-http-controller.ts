import { Request } from 'express';
import { HttpResponse } from '@/shared/protocols/http';
import { noContent } from '@/shared/helpers';
import { ItemIdSchema } from '../dto';
import { ItemDeleteUseCase } from '../usecases';

export class ItemDeleteHttpController {
  constructor(private readonly itemDeleteUseCase: ItemDeleteUseCase) { }

  async handle(req: Request): Promise<HttpResponse> {
    const idParsed = ItemIdSchema.parse(req.params);
    await this.itemDeleteUseCase.execute(idParsed);
    return noContent();
  }
}

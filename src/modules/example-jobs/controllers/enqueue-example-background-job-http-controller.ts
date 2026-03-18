import { Request } from 'express';
import { created } from '@/shared/helpers';
import { HttpResponse } from '@/shared/protocols/http';
import { EnqueueExampleBackgroundJobInputSchema } from '../dto';
import { EnqueueExampleBackgroundJobUseCase } from '../usecases';

export class EnqueueExampleBackgroundJobHttpController {
  constructor(
    private readonly enqueueExampleBackgroundJobUseCase: EnqueueExampleBackgroundJobUseCase
  ) {}

  public async handle(req: Request): Promise<HttpResponse> {
    const parsed = EnqueueExampleBackgroundJobInputSchema.parse(req.body);
    const result = await this.enqueueExampleBackgroundJobUseCase.execute(parsed);
    return created(result);
  }
}

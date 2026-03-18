import { Request } from 'express';
import { created } from '@/shared/helpers';
import { HttpResponse } from '@/shared/protocols/http';
import { EnqueueDelayedExampleBackgroundJobInputSchema } from '../dto';
import { EnqueueDelayedExampleBackgroundJobUseCase } from '../usecases';

export class EnqueueDelayedExampleBackgroundJobHttpController {
  constructor(
    private readonly enqueueDelayedExampleBackgroundJobUseCase: EnqueueDelayedExampleBackgroundJobUseCase
  ) {}

  public async handle(req: Request): Promise<HttpResponse> {
    const parsed = EnqueueDelayedExampleBackgroundJobInputSchema.parse(req.body);
    const result = await this.enqueueDelayedExampleBackgroundJobUseCase.execute(
      parsed
    );
    return created(result);
  }
}

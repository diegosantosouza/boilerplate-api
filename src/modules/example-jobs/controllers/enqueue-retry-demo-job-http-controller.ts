import { Request } from 'express';
import { created } from '@/shared/helpers';
import { HttpResponse } from '@/shared/protocols/http';
import { EnqueueRetryDemoJobInputSchema } from '../dto';
import { EnqueueRetryDemoJobUseCase } from '../usecases';

export class EnqueueRetryDemoJobHttpController {
  constructor(
    private readonly enqueueRetryDemoJobUseCase: EnqueueRetryDemoJobUseCase
  ) {}

  public async handle(req: Request): Promise<HttpResponse> {
    const parsed = EnqueueRetryDemoJobInputSchema.parse(req.body);
    const result = await this.enqueueRetryDemoJobUseCase.execute(parsed);
    return created(result);
  }
}

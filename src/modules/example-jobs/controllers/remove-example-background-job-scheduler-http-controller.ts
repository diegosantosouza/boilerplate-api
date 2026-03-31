import type { Request } from 'express';
import { ok } from '@/shared/helpers';
import type { HttpResponse } from '@/shared/protocols/http';
import { ExampleBackgroundJobSchedulerIdSchema } from '../dto';
import type { RemoveExampleBackgroundJobSchedulerUseCase } from '../usecases';

export class RemoveExampleBackgroundJobSchedulerHttpController {
  constructor(
    private readonly removeExampleBackgroundJobSchedulerUseCase: RemoveExampleBackgroundJobSchedulerUseCase
  ) {}

  public async handle(req: Request): Promise<HttpResponse> {
    const parsed = ExampleBackgroundJobSchedulerIdSchema.parse(req.params);
    const result =
      await this.removeExampleBackgroundJobSchedulerUseCase.execute(parsed);
    return ok(result);
  }
}

import { Request } from 'express';
import { created } from '@/shared/helpers';
import { HttpResponse } from '@/shared/protocols/http';
import { UpsertExampleBackgroundJobSchedulerInputSchema } from '../dto';
import { UpsertExampleBackgroundJobSchedulerUseCase } from '../usecases';

export class UpsertExampleBackgroundJobSchedulerHttpController {
  constructor(
    private readonly upsertExampleBackgroundJobSchedulerUseCase: UpsertExampleBackgroundJobSchedulerUseCase
  ) {}

  public async handle(req: Request): Promise<HttpResponse> {
    const parsed = UpsertExampleBackgroundJobSchedulerInputSchema.parse(req.body);
    const result = await this.upsertExampleBackgroundJobSchedulerUseCase.execute(
      parsed
    );
    return created(result);
  }
}

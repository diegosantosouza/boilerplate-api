import { Request } from 'express';
import { ok } from '@/shared/helpers';
import { HttpResponse } from '@/shared/protocols/http';
import { ListExampleBackgroundJobSchedulersUseCase } from '../usecases';

export class ListExampleBackgroundJobSchedulersHttpController {
  constructor(
    private readonly listExampleBackgroundJobSchedulersUseCase: ListExampleBackgroundJobSchedulersUseCase
  ) {}

  public async handle(_req: Request): Promise<HttpResponse> {
    const result = await this.listExampleBackgroundJobSchedulersUseCase.execute();
    return ok(result);
  }
}

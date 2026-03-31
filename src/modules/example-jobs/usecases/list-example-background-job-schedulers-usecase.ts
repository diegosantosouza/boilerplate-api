import type { ExampleBackgroundJobService } from '../services';

export class ListExampleBackgroundJobSchedulersUseCase {
  constructor(
    private readonly exampleBackgroundJobService: ExampleBackgroundJobService
  ) {}

  public async execute(): Promise<ListExampleBackgroundJobSchedulersUseCase.Output> {
    return this.exampleBackgroundJobService.listSchedulers();
  }
}

export namespace ListExampleBackgroundJobSchedulersUseCase {
  export type Output = Awaited<
    ReturnType<ExampleBackgroundJobService['listSchedulers']>
  >;
}

import type { UpsertExampleBackgroundJobSchedulerInput } from '../dto';
import type { ExampleBackgroundJobService } from '../services';

export class UpsertExampleBackgroundJobSchedulerUseCase {
  constructor(
    private readonly exampleBackgroundJobService: ExampleBackgroundJobService
  ) {}

  public async execute(
    input: UpsertExampleBackgroundJobSchedulerUseCase.Input = {}
  ): Promise<UpsertExampleBackgroundJobSchedulerUseCase.Output> {
    return this.exampleBackgroundJobService.upsertScheduler(input);
  }
}

export namespace UpsertExampleBackgroundJobSchedulerUseCase {
  export type Input = UpsertExampleBackgroundJobSchedulerInput;
  export type Output = Awaited<
    ReturnType<ExampleBackgroundJobService['upsertScheduler']>
  >;
}

import type { RemoveExampleBackgroundJobSchedulerInput } from '../dto';
import type { ExampleBackgroundJobService } from '../services';

export class RemoveExampleBackgroundJobSchedulerUseCase {
  constructor(
    private readonly exampleBackgroundJobService: ExampleBackgroundJobService
  ) {}

  public async execute(
    input: RemoveExampleBackgroundJobSchedulerUseCase.Input
  ): Promise<RemoveExampleBackgroundJobSchedulerUseCase.Output> {
    return this.exampleBackgroundJobService.removeScheduler(input.schedulerId);
  }
}

export namespace RemoveExampleBackgroundJobSchedulerUseCase {
  export type Input = RemoveExampleBackgroundJobSchedulerInput;
  export type Output = Awaited<
    ReturnType<ExampleBackgroundJobService['removeScheduler']>
  >;
}

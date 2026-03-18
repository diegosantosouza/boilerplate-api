import {
  EnqueueDelayedExampleBackgroundJobInput,
  EnqueueDelayedExampleBackgroundJobOutput,
} from '../dto';
import { ExampleBackgroundJobService } from '../services';

export class EnqueueDelayedExampleBackgroundJobUseCase {
  constructor(
    private readonly exampleBackgroundJobService: ExampleBackgroundJobService
  ) {}

  public async execute(
    input: EnqueueDelayedExampleBackgroundJobUseCase.Input
  ): Promise<EnqueueDelayedExampleBackgroundJobUseCase.Output> {
    return this.exampleBackgroundJobService.enqueueDelayed(input);
  }
}

export namespace EnqueueDelayedExampleBackgroundJobUseCase {
  export type Input = EnqueueDelayedExampleBackgroundJobInput;
  export type Output = EnqueueDelayedExampleBackgroundJobOutput;
}

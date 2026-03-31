import type {
  EnqueueExampleBackgroundJobInput,
  EnqueueExampleBackgroundJobOutput,
} from '../dto';
import type { ExampleBackgroundJobService } from '../services';

export class EnqueueExampleBackgroundJobUseCase {
  constructor(
    private readonly exampleBackgroundJobService: ExampleBackgroundJobService
  ) {}

  public async execute(
    input: EnqueueExampleBackgroundJobUseCase.Input
  ): Promise<EnqueueExampleBackgroundJobUseCase.Output> {
    return this.exampleBackgroundJobService.enqueueImmediate(input);
  }
}

export namespace EnqueueExampleBackgroundJobUseCase {
  export type Input = EnqueueExampleBackgroundJobInput;
  export type Output = EnqueueExampleBackgroundJobOutput;
}

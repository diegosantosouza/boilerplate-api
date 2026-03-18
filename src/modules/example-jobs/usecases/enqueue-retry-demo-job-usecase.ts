import {
  EnqueueRetryDemoJobInput,
  EnqueueRetryDemoJobOutput,
} from '../dto';
import { ExampleBackgroundJobService } from '../services';

export class EnqueueRetryDemoJobUseCase {
  constructor(
    private readonly exampleBackgroundJobService: ExampleBackgroundJobService
  ) {}

  public async execute(
    input: EnqueueRetryDemoJobUseCase.Input
  ): Promise<EnqueueRetryDemoJobUseCase.Output> {
    return this.exampleBackgroundJobService.enqueueRetryDemo(input);
  }
}

export namespace EnqueueRetryDemoJobUseCase {
  export type Input = EnqueueRetryDemoJobInput;
  export type Output = EnqueueRetryDemoJobOutput;
}

import { EnqueueRetryDemoJobHttpController } from '../controllers';
import { EnqueueRetryDemoJobUseCase } from '../usecases';
import { makeExampleBackgroundJobService } from './make-example-background-job-service';

export const makeEnqueueRetryDemoJobController =
  (): EnqueueRetryDemoJobHttpController => {
    const useCase = new EnqueueRetryDemoJobUseCase(
      makeExampleBackgroundJobService()
    );
    return new EnqueueRetryDemoJobHttpController(useCase);
  };

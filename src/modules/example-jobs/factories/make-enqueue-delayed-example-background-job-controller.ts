import { EnqueueDelayedExampleBackgroundJobHttpController } from '../controllers';
import { EnqueueDelayedExampleBackgroundJobUseCase } from '../usecases';
import { makeExampleBackgroundJobService } from './make-example-background-job-service';

export const makeEnqueueDelayedExampleBackgroundJobController =
  (): EnqueueDelayedExampleBackgroundJobHttpController => {
    const useCase = new EnqueueDelayedExampleBackgroundJobUseCase(
      makeExampleBackgroundJobService()
    );
    return new EnqueueDelayedExampleBackgroundJobHttpController(useCase);
  };

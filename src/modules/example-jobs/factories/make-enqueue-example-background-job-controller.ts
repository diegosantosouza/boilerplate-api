import { EnqueueExampleBackgroundJobHttpController } from '../controllers';
import { EnqueueExampleBackgroundJobUseCase } from '../usecases';
import { makeExampleBackgroundJobService } from './make-example-background-job-service';

export const makeEnqueueExampleBackgroundJobController =
  (): EnqueueExampleBackgroundJobHttpController => {
    const useCase = new EnqueueExampleBackgroundJobUseCase(
      makeExampleBackgroundJobService()
    );
    return new EnqueueExampleBackgroundJobHttpController(useCase);
  };

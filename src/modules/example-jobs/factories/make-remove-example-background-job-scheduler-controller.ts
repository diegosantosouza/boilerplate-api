import { RemoveExampleBackgroundJobSchedulerHttpController } from '../controllers';
import { RemoveExampleBackgroundJobSchedulerUseCase } from '../usecases';
import { makeExampleBackgroundJobService } from './make-example-background-job-service';

export const makeRemoveExampleBackgroundJobSchedulerController =
  (): RemoveExampleBackgroundJobSchedulerHttpController => {
    const useCase = new RemoveExampleBackgroundJobSchedulerUseCase(
      makeExampleBackgroundJobService()
    );
    return new RemoveExampleBackgroundJobSchedulerHttpController(useCase);
  };

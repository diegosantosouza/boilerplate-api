import { UpsertExampleBackgroundJobSchedulerHttpController } from '../controllers';
import { UpsertExampleBackgroundJobSchedulerUseCase } from '../usecases';
import { makeExampleBackgroundJobService } from './make-example-background-job-service';

export const makeUpsertExampleBackgroundJobSchedulerController =
  (): UpsertExampleBackgroundJobSchedulerHttpController => {
    const useCase = new UpsertExampleBackgroundJobSchedulerUseCase(
      makeExampleBackgroundJobService()
    );
    return new UpsertExampleBackgroundJobSchedulerHttpController(useCase);
  };

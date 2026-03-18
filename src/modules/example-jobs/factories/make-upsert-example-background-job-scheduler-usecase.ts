import { UpsertExampleBackgroundJobSchedulerUseCase } from '../usecases';
import { makeExampleBackgroundJobService } from './make-example-background-job-service';

export const makeUpsertExampleBackgroundJobSchedulerUseCase =
  (): UpsertExampleBackgroundJobSchedulerUseCase =>
    new UpsertExampleBackgroundJobSchedulerUseCase(
      makeExampleBackgroundJobService()
    );

import { ListExampleBackgroundJobSchedulersHttpController } from '../controllers';
import { ListExampleBackgroundJobSchedulersUseCase } from '../usecases';
import { makeExampleBackgroundJobService } from './make-example-background-job-service';

export const makeListExampleBackgroundJobSchedulersController =
  (): ListExampleBackgroundJobSchedulersHttpController => {
    const useCase = new ListExampleBackgroundJobSchedulersUseCase(
      makeExampleBackgroundJobService()
    );
    return new ListExampleBackgroundJobSchedulersHttpController(useCase);
  };

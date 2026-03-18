import { ExampleBackgroundJobService } from '../services';

let exampleBackgroundJobServiceInstance: ExampleBackgroundJobService | null =
  null;

export const makeExampleBackgroundJobService =
  (): ExampleBackgroundJobService => {
    if (!exampleBackgroundJobServiceInstance) {
      exampleBackgroundJobServiceInstance = new ExampleBackgroundJobService();
    }

    return exampleBackgroundJobServiceInstance;
  };

import { makeMessageBroker } from '@/infrastructure/messaging/message-broker-factory';
import { ExampleSyncDatasource } from '@/shared/datasources';
import { ExampleSyncResourceRepository } from '@/shared/repository/example-sync-resource-repository';
import { DispatchExampleSyncUseCase } from '../usecases';

export const makeDispatchExampleSyncUseCase =
  (): DispatchExampleSyncUseCase => {
    const resourceRepository = new ExampleSyncResourceRepository(
      new ExampleSyncDatasource()
    );
    const messageBroker = makeMessageBroker();

    return new DispatchExampleSyncUseCase(resourceRepository, messageBroker);
  };

import { DispatchExampleSyncUseCase } from '@/modules/example-sync';
import { env } from '@/shared/config/env';
import { ExampleSyncResourceRepository } from '@/shared/repository/example-sync-resource-repository';
import { MessagePublisher } from '@/shared/messaging';

describe('DispatchExampleSyncUseCase', () => {
  const originalExampleExternalApiUrl = env.example_external_api_url;
  const originalExampleSyncDestination = env.example_sync_destination;

  let resourceRepository: jest.Mocked<ExampleSyncResourceRepository>;
  let messagePublisher: jest.Mocked<MessagePublisher>;
  let usecase: DispatchExampleSyncUseCase;

  beforeEach(() => {
    resourceRepository = {
      list: jest.fn(),
    } as any;

    messagePublisher = {
      publish: jest.fn().mockResolvedValue({ messageId: 'message-1' }),
    };

    usecase = new DispatchExampleSyncUseCase(resourceRepository, messagePublisher);
    env.example_sync_destination = 'example-sync';
  });

  afterAll(() => {
    env.example_external_api_url = originalExampleExternalApiUrl;
    env.example_sync_destination = originalExampleSyncDestination;
  });

  it('should skip dispatch when the external API is not configured', async () => {
    env.example_external_api_url = undefined;

    const result = await usecase.execute();

    expect(result).toBe(0);
    expect(resourceRepository.list).not.toHaveBeenCalled();
    expect(messagePublisher.publish).not.toHaveBeenCalled();
  });

  it('should publish one message per external resource', async () => {
    env.example_external_api_url = 'https://external-api.test';
    resourceRepository.list.mockResolvedValue([
      {
        id: 'resource-1',
        payload: { id: 'resource-1', name: 'Item 1' },
      },
      {
        id: 'resource-2',
        payload: { id: 'resource-2', name: 'Item 2' },
      },
    ]);

    const result = await usecase.execute();

    expect(result).toBe(2);
    expect(resourceRepository.list).toHaveBeenCalledTimes(1);
    expect(messagePublisher.publish).toHaveBeenCalledTimes(2);
    expect(messagePublisher.publish).toHaveBeenNthCalledWith(1, {
      destination: 'example-sync',
      payload: {
        action: 'sync',
        data: {
          id: 'resource-1',
          payload: { id: 'resource-1', name: 'Item 1' },
        },
      },
      attributes: {
        action: 'sync',
        resourceId: 'resource-1',
      },
      orderingKey: 'resource-1',
    });
  });
});

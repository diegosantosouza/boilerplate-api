import { env } from '@/shared/config/env';
import Log from '@/shared/logger/log';
import type { MessagePublisher } from '@/shared/messaging';
import type { ExampleSyncResourceRepository } from '@/shared/repository/example-sync-resource-repository';

export class DispatchExampleSyncUseCase {
  constructor(
    private readonly resourceRepository: ExampleSyncResourceRepository,
    private readonly messagePublisher: MessagePublisher
  ) {}

  public async execute(): Promise<number> {
    if (!env.example_external_api_url) {
      Log.warn(
        JSON.stringify({
          event: '[DispatchExampleSyncUseCase:skip]',
          data: {
            message:
              'EXAMPLE_EXTERNAL_API_URL is not configured, skipping external sync example',
          },
        })
      );

      return 0;
    }

    const resources = await this.resourceRepository.list();

    if (!resources.length) {
      Log.info(
        JSON.stringify({
          event: '[DispatchExampleSyncUseCase:empty]',
          data: {
            message: 'No external resources found for synchronization',
          },
        })
      );

      return 0;
    }

    await Promise.all(
      resources.map(resource =>
        this.messagePublisher.publish({
          destination: env.example_sync_destination,
          payload: {
            action: 'sync',
            data: resource,
          },
          attributes: {
            action: 'sync',
            resourceId: resource.id,
          },
          orderingKey: resource.id,
        })
      )
    );

    Log.info(
      JSON.stringify({
        event: '[DispatchExampleSyncUseCase:success]',
        data: {
          totalResources: resources.length,
          destination: env.example_sync_destination,
          message: 'Example sync messages published successfully',
        },
      })
    );

    return resources.length;
  }
}

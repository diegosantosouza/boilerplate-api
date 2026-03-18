import { PubSub } from '@google-cloud/pubsub';
import { env } from '@/shared/config/env';
import Log from '@/shared/logger/log';

let pubSubClientInstance: PubSub | null = null;

export function getGcpPubSubClient(): PubSub {
  if (!pubSubClientInstance) {
    const pubsubConfig: { projectId: string; apiEndpoint?: string } = {
      projectId: env.messaging_gcp_project_id ?? '',
    };

    if (process.env.PUBSUB_EMULATOR_HOST) {
      pubsubConfig.apiEndpoint = process.env.PUBSUB_EMULATOR_HOST;
    }

    pubSubClientInstance = new PubSub(pubsubConfig);

    Log.info(
      JSON.stringify({
        event: '[GcpPubSubClient:initialization:success]',
        data: {
          projectId: pubsubConfig.projectId,
          usingEmulator: !!pubsubConfig.apiEndpoint,
          apiEndpoint: pubsubConfig.apiEndpoint,
          message: 'GCP PubSub client initialized',
        },
      })
    );
  }

  return pubSubClientInstance;
}

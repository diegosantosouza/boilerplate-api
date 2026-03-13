import { PubSub } from '@google-cloud/pubsub';
import Log from '@/shared/logger/log';

let pubSubClientInstance: PubSub | null = null;

export function getPubSubClient(): PubSub {
  if (!pubSubClientInstance) {
    const pubsubConfig: { projectId: string; apiEndpoint?: string } = {
      projectId: process.env.GCP_PROJECT_ID || '',
    };

    if (process.env.PUBSUB_EMULATOR_HOST) {
      pubsubConfig.apiEndpoint = process.env.PUBSUB_EMULATOR_HOST;
    }

    pubSubClientInstance = new PubSub(pubsubConfig);

    Log.info(
      JSON.stringify({
        event: '[PubSubClient:initialization:success]',
        data: {
          projectId: pubsubConfig.projectId,
          usingEmulator: !!pubsubConfig.apiEndpoint,
          apiEndpoint: pubsubConfig.apiEndpoint,
          message: 'PubSub client initialized',
        },
      })
    );
  }

  return pubSubClientInstance;
}

export class GcpPubSub {
  private readonly topic: string;
  private readonly message: string;
  private _messageAttributes: Record<string, string> = {};
  private _messageGroupId?: string;

  constructor(topic: string, message: string) {
    this.topic = topic;
    this.message = message;
  }

  public set messageAttributes(attributes: Record<string, string>) {
    this._messageAttributes = attributes;
  }

  public set messageGroupId(groupId: string) {
    this._messageGroupId = groupId;
  }

  public async publish(): Promise<string | undefined> {
    try {
      const pubSubClient = getPubSubClient();
      const topicInstance = pubSubClient.topic(this.topic);
      const dataBuffer = Buffer.from(this.message);

      const messageId = await topicInstance.publishMessage({
        data: dataBuffer,
      });

      Log.info(
        JSON.stringify({
          event: '[GcpPubSub:publish:success]',
          data: {
            messageId,
            topic: this.topic,
            message: 'Message published successfully',
          },
        })
      );

      return messageId;
    } catch (error) {
      Log.error(
        JSON.stringify({
          event: '[GcpPubSub:publish:error]',
          data: {
            topic: this.topic,
            error:
              error instanceof Error
                ? {
                  message: error.message,
                  name: error.name,
                  stack: error.stack,
                }
                : 'Unknown error',
            message: 'Unable to publish PubSub message',
          },
        })
      );
      return undefined;
    }
  }
}

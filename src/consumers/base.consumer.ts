import Log from '@/shared/logger/log';
import { MongoHelper } from '@/infrastructure/database/mongo-helper';
import { env } from '@/shared/config/env';
import { Message } from '@google-cloud/pubsub';
import { getPubSubClient } from '@/shared/pubsub/gcp-pubsub';

export interface PubSubMessage {
  data: Buffer;
  attributes: Record<string, string>;
}

export abstract class BaseConsumer {
  private static mongoConnected = false;
  protected static consumerName: string;
  protected static maxMessages: number = 10;

  protected static onMessage(
    payload: unknown,
    messageId: string,
    attributes: Record<string, string>
  ): Promise<void> {
    throw new Error('onMessage must be implemented by subclass');
  }

  private static async ensureMongoConnection(): Promise<void> {
    if (!BaseConsumer.mongoConnected) {
      Log.info(
        JSON.stringify({
          event: '[BaseConsumer:mongo:connecting]',
          data: {
            message: 'Connecting to MongoDB for consumer',
          },
        })
      );

      await MongoHelper.connect(String(env.mongo_uri), env.mongo_debug);
      BaseConsumer.mongoConnected = true;

      Log.info(
        JSON.stringify({
          event: '[BaseConsumer:mongo:connected]',
          data: {
            message: 'MongoDB connected successfully for consumer',
          },
        })
      );
    }
  }

  private static createConsumer(
    subscriptionName: string,
    ConsumerClass: typeof BaseConsumer
  ): void {
    try {
      Log.info(
        JSON.stringify({
          event: `[${this.consumerName}:initialization:start]`,
          data: {
            message: `Initializing ${this.consumerName}`,
          },
        })
      );

      const pubsub = getPubSubClient();

      if (!subscriptionName) {
        throw new Error(
          `Subscription name is required for ${this.consumerName}`
        );
      }

      const subscription = pubsub.subscription(subscriptionName, {
        flowControl: {
          maxMessages: this.maxMessages,
          allowExcessMessages: false,
        },
      });

      subscription.on('message', async (message: Message) => {
        const startTime = Date.now();
        const messageId = message.id;

        try {
          Log.info(
            JSON.stringify({
              event: `[${this.consumerName}:pubsub:start]`,
              data: {
                messageId,
                message: 'Starting PubSub message processing',
              },
            })
          );

          await BaseConsumer.ensureMongoConnection();

          const payload = JSON.parse(message.data.toString());
          const attributes = {
            ...message.attributes,
            messageId: messageId,
          };

          await (ConsumerClass as typeof BaseConsumer).onMessage(
            payload,
            messageId,
            attributes
          );

          message.ack();

          const processingTime = Date.now() - startTime;
          Log.info(
            JSON.stringify({
              event: `[${this.consumerName}:pubsub:success]`,
              data: {
                messageId,
                processingTimeMs: processingTime,
                message: 'PubSub message processed successfully',
              },
            })
          );
        } catch (error) {
          const processingTime = Date.now() - startTime;
          Log.error(
            JSON.stringify({
              event: `[${this.consumerName}:pubsub:error]`,
              data: {
                messageId,
                processingTimeMs: processingTime,
                error:
                  error instanceof Error
                    ? {
                      message: error.message,
                      name: error.name,
                      stack: error.stack,
                    }
                    : 'Unknown error',
                message: 'Error processing PubSub message',
              },
            })
          );

          message.nack();
        }
      });

      subscription.on('error', (error: Error) => {
        Log.error(
          JSON.stringify({
            event: `[${this.consumerName}:pubsub:subscription_error]`,
            data: {
              error:
                error instanceof Error
                  ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                  }
                  : 'Unknown error',
              message: 'PubSub subscription error',
            },
          })
        );
      });

      Log.info(
        JSON.stringify({
          event: `[${this.consumerName}:initialization:success]`,
          data: {
            subscriptionName,
            message: `${this.consumerName} PubSub consumer initialized`,
          },
        })
      );
    } catch (error) {
      Log.error(
        JSON.stringify({
          event: `[${this.consumerName}:initialization:error]`,
          data: {
            error:
              error instanceof Error
                ? {
                  message: error.message,
                  name: error.name,
                  stack: error.stack,
                }
                : 'Unknown error',
            message: `Error initializing ${this.consumerName}`,
          },
        })
      );
      throw error;
    }
  }

  public static makeConsumer(
    envVarName: string
  ): void {
    const subscriptionName = process.env[envVarName] || '';

    if (!subscriptionName) {
      throw new Error(`${envVarName} environment variable is required`);
    }

    this.createConsumer(subscriptionName, this as typeof BaseConsumer);
  }
}

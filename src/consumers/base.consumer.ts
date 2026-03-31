import { MongoHelper } from '@/infrastructure/database/mongo-helper';
import { makeMessageBroker } from '@/infrastructure/messaging/message-broker-factory';
import { env } from '@/shared/config/env';
import Log from '@/shared/logger/log';
import type { BrokerMessage } from '@/shared/messaging';

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
    destination: string,
    ConsumerClass: typeof BaseConsumer
  ): void {
    try {
      Log.info(
        JSON.stringify({
          event: `[${BaseConsumer.consumerName}:initialization:start]`,
          data: {
            message: `Initializing ${BaseConsumer.consumerName}`,
          },
        })
      );

      if (!destination) {
        throw new Error(
          `Destination is required for ${BaseConsumer.consumerName}`
        );
      }

      const broker = makeMessageBroker();

      void broker.subscribe({
        destination,
        maxMessages: BaseConsumer.maxMessages,
        handler: async (message: BrokerMessage) => {
          const startTime = Date.now();
          const messageId = message.id;

          try {
            Log.info(
              JSON.stringify({
                event: `[${BaseConsumer.consumerName}:consumer:start]`,
                data: {
                  messageId,
                  message: 'Starting PubSub message processing',
                },
              })
            );

            await BaseConsumer.ensureMongoConnection();

            const attributes = {
              ...message.attributes,
              messageId: messageId,
            };

            await (ConsumerClass as typeof BaseConsumer).onMessage(
              message.payload,
              messageId,
              attributes
            );

            message.ack();

            const processingTime = Date.now() - startTime;
            Log.info(
              JSON.stringify({
                event: `[${BaseConsumer.consumerName}:consumer:success]`,
                data: {
                  messageId,
                  processingTimeMs: processingTime,
                  message: 'Broker message processed successfully',
                },
              })
            );
          } catch (error) {
            const processingTime = Date.now() - startTime;
            Log.error(
              JSON.stringify({
                event: `[${BaseConsumer.consumerName}:consumer:error]`,
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
                  message: 'Error processing broker message',
                },
              })
            );

            message.nack();
          }
        },
      });

      Log.info(
        JSON.stringify({
          event: `[${BaseConsumer.consumerName}:initialization:success]`,
          data: {
            destination,
            message: `${BaseConsumer.consumerName} broker consumer initialized`,
          },
        })
      );
    } catch (error) {
      Log.error(
        JSON.stringify({
          event: `[${BaseConsumer.consumerName}:initialization:error]`,
          data: {
            error:
              error instanceof Error
                ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                  }
                : 'Unknown error',
            message: `Error initializing ${BaseConsumer.consumerName}`,
          },
        })
      );
      throw error;
    }
  }

  public static makeConsumer(
    envVarName: string,
    fallbackDestination = ''
  ): void {
    const destination = process.env[envVarName] || fallbackDestination;

    if (!destination) {
      throw new Error(`${envVarName} environment variable is required`);
    }

    BaseConsumer.createConsumer(
      destination,
      BaseConsumer as typeof BaseConsumer
    );
  }
}

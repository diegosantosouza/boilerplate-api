import Log from '@/shared/logger/log';
import { MongoHelper } from '@/infrastructure/database/mongo-helper';
import { env } from '@/shared/config/env';
import { makeMessageBroker } from '@/infrastructure/messaging/message-broker-factory';
import { BrokerMessage } from '@/shared/messaging';

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
          event: `[${this.consumerName}:initialization:start]`,
          data: {
            message: `Initializing ${this.consumerName}`,
          },
        })
      );

      if (!destination) {
        throw new Error(`Destination is required for ${this.consumerName}`);
      }

      const broker = makeMessageBroker();

      void broker.subscribe({
        destination,
        maxMessages: this.maxMessages,
        handler: async (message: BrokerMessage) => {
          const startTime = Date.now();
          const messageId = message.id;

          try {
            Log.info(
              JSON.stringify({
                event: `[${this.consumerName}:consumer:start]`,
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
                event: `[${this.consumerName}:consumer:success]`,
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
                event: `[${this.consumerName}:consumer:error]`,
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
          event: `[${this.consumerName}:initialization:success]`,
          data: {
            destination,
            message: `${this.consumerName} broker consumer initialized`,
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
    envVarName: string,
    fallbackDestination = ''
  ): void {
    const destination = process.env[envVarName] || fallbackDestination;

    if (!destination) {
      throw new Error(`${envVarName} environment variable is required`);
    }

    this.createConsumer(destination, this as typeof BaseConsumer);
  }
}

import type { Message } from '@google-cloud/pubsub';
import Log from '@/shared/logger/log';
import type {
  BrokerMessage,
  MessageBroker,
  PublishInput,
  PublishResult,
  SubscribeInput,
} from '@/shared/messaging';
import { getGcpPubSubClient } from './gcp-pubsub-client';

export class GcpPubSubBroker implements MessageBroker {
  public async publish<TPayload = unknown>(
    input: PublishInput<TPayload>
  ): Promise<PublishResult> {
    try {
      const topic = getGcpPubSubClient().topic(input.destination);
      const messageId = await topic.publishMessage({
        data: Buffer.from(JSON.stringify(input.payload)),
        attributes: input.attributes,
        orderingKey: input.orderingKey,
      });

      Log.info(
        JSON.stringify({
          event: '[GcpPubSubBroker:publish:success]',
          data: {
            destination: input.destination,
            messageId,
            message: 'Message published successfully',
          },
        })
      );

      return { messageId };
    } catch (error) {
      Log.error(
        JSON.stringify({
          event: '[GcpPubSubBroker:publish:error]',
          data: {
            destination: input.destination,
            error:
              error instanceof Error
                ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                  }
                : 'Unknown error',
            message: 'Unable to publish broker message',
          },
        })
      );

      return {};
    }
  }

  public async subscribe<TPayload = unknown>(
    input: SubscribeInput<TPayload>
  ): Promise<void> {
    const subscription = getGcpPubSubClient().subscription(input.destination, {
      flowControl: {
        maxMessages: input.maxMessages ?? 10,
        allowExcessMessages: false,
      },
    });

    subscription.on('message', (message: Message) => {
      const brokerMessage = this.makeBrokerMessage<TPayload>(message);

      void input.handler(brokerMessage).catch(error => {
        Log.error(
          JSON.stringify({
            event: '[GcpPubSubBroker:subscribe:handler_error]',
            data: {
              destination: input.destination,
              messageId: message.id,
              error:
                error instanceof Error
                  ? {
                      message: error.message,
                      name: error.name,
                      stack: error.stack,
                    }
                  : 'Unknown error',
              message: 'Unhandled error received from broker handler',
            },
          })
        );
      });
    });

    subscription.on('error', (error: Error) => {
      Log.error(
        JSON.stringify({
          event: '[GcpPubSubBroker:subscribe:error]',
          data: {
            destination: input.destination,
            error: {
              message: error.message,
              name: error.name,
              stack: error.stack,
            },
            message: 'Subscription error received from broker',
          },
        })
      );
    });
  }

  private makeBrokerMessage<TPayload>(
    message: Message
  ): BrokerMessage<TPayload> {
    return {
      id: message.id,
      payload: this.parsePayload<TPayload>(message.data),
      attributes: message.attributes,
      ack: () => message.ack(),
      nack: () => message.nack(),
    };
  }

  private parsePayload<TPayload>(data: Buffer): TPayload {
    const rawPayload = data.toString();

    try {
      return JSON.parse(rawPayload) as TPayload;
    } catch {
      return rawPayload as TPayload;
    }
  }
}

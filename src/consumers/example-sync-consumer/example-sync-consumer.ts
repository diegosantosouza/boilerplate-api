import { BaseConsumer } from '../base.consumer';
import Log from '@/shared/logger/log';

interface ExampleSyncMessage {
  action: string;
  data: unknown;
}

class ExampleSyncConsumer extends BaseConsumer {
  protected static consumerName = 'ExampleSyncConsumer';

  protected static async onMessage(
    payload: unknown,
    messageId: string,
    attributes: Record<string, string>
  ): Promise<void> {
    const messageData = payload as ExampleSyncMessage;

    Log.info(
      JSON.stringify({
        event: '[ExampleSyncConsumer:onMessage]',
        data: {
          messageId,
          action: messageData.action,
          message: 'Processing example sync message',
        },
      })
    );

    // TODO: Implement your message processing logic here
  }
}

ExampleSyncConsumer.makeConsumer('EXAMPLE_SYNC_SUBSCRIPTION');

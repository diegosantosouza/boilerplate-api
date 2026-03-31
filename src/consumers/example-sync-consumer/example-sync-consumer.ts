import '@/instrumentation';
import {
  type ExampleSyncMessage,
  makeProcessExampleSyncMessageUseCase,
} from '@/modules/example-sync';
import { env } from '@/shared/config/env';
import Log from '@/shared/logger/log';
import { BaseConsumer } from '../base.consumer';

const processExampleSyncMessageUseCase = makeProcessExampleSyncMessageUseCase();

class ExampleSyncConsumer extends BaseConsumer {
  protected static consumerName = 'ExampleSyncConsumer';

  protected static async onMessage(
    payload: unknown,
    messageId: string,
    _attributes: Record<string, string>
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

    await processExampleSyncMessageUseCase.execute(messageData);
  }
}

ExampleSyncConsumer.makeConsumer(
  'EXAMPLE_SYNC_CONSUMER_DESTINATION',
  env.example_sync_consumer_destination
);

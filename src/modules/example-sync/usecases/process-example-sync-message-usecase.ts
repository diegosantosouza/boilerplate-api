import Log from '@/shared/logger/log';
import { ExampleSyncMessage } from '../types/example-sync-resource';

export class ProcessExampleSyncMessageUseCase {
  public async execute(input: ExampleSyncMessage): Promise<void> {
    Log.info(
      JSON.stringify({
        event: '[ProcessExampleSyncMessageUseCase:execute]',
        data: {
          action: input.action,
          resourceId: input.data.id,
          message: 'Processing example sync payload',
        },
      })
    );
  }
}

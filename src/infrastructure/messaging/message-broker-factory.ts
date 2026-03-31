import { env } from '@/shared/config/env';
import type { MessageBroker } from '@/shared/messaging';
import { GcpPubSubBroker } from './gcp/gcp-pubsub-broker';

let brokerInstance: MessageBroker | null = null;

export const makeMessageBroker = (): MessageBroker => {
  if (brokerInstance) {
    return brokerInstance;
  }

  switch (env.messaging_driver) {
    case 'gcp-pubsub':
      brokerInstance = new GcpPubSubBroker();
      return brokerInstance;
    default:
      throw new Error(
        `MESSAGING_DRIVER "${env.messaging_driver}" is not supported`
      );
  }
};

export {
  DomainEvent,
  DomainEventBus,
  EventHandler,
} from './domain-event-bus';
export { LocalEventBus } from './local-event-bus';

import type { DomainEventBus } from './domain-event-bus';
import { LocalEventBus } from './local-event-bus';

const eventBus: DomainEventBus = new LocalEventBus();

export { eventBus };

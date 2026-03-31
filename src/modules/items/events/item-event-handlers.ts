import { eventBus } from '@/shared/events';
import Log from '@/shared/logger/log';
import {
  type ItemCreatedPayload,
  type ItemDeletedPayload,
  ItemEvents,
  type ItemUpdatedPayload,
} from './item-events';

export function registerItemEventHandlers() {
  eventBus.subscribe<ItemCreatedPayload>(ItemEvents.CREATED, event => {
    Log.info(`[ItemEvents] Item created`, { id: event.payload.id });
  });

  eventBus.subscribe<ItemUpdatedPayload>(ItemEvents.UPDATED, event => {
    Log.info(`[ItemEvents] Item updated`, { id: event.payload.id });
  });

  eventBus.subscribe<ItemDeletedPayload>(ItemEvents.DELETED, event => {
    Log.info(`[ItemEvents] Item deleted`, { id: event.payload.id });
  });
}

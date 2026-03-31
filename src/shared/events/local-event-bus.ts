import { EventEmitter } from 'node:events';
import Log from '@/shared/logger/log';
import type {
  DomainEvent,
  DomainEventBus,
  EventHandler,
} from './domain-event-bus';

export class LocalEventBus implements DomainEventBus {
  private emitter = new EventEmitter();
  private handlerMap = new Map<
    string,
    Map<EventHandler, (...args: any[]) => void>
  >();

  publish<T = unknown>(event: DomainEvent<T>): void {
    Log.debug(`[EventBus] Publishing: ${event.name}`);
    this.emitter.emit(event.name, event);
  }

  subscribe<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    Log.debug(`[EventBus] Subscribed to: ${eventName}`);
    const wrappedHandler = async (event: DomainEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        Log.error(`[EventBus] Handler error for ${eventName}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    if (!this.handlerMap.has(eventName)) {
      this.handlerMap.set(eventName, new Map());
    }
    this.handlerMap
      .get(eventName)!
      .set(handler as EventHandler, wrappedHandler);
    this.emitter.on(eventName, wrappedHandler);
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    const eventHandlers = this.handlerMap.get(eventName);
    if (eventHandlers) {
      const wrappedHandler = eventHandlers.get(handler);
      if (wrappedHandler) {
        this.emitter.off(eventName, wrappedHandler);
        eventHandlers.delete(handler);
      }
    }
  }
}

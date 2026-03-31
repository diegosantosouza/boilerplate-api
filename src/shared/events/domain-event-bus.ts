export interface DomainEvent<T = unknown> {
  name: string;
  payload: T;
  occurredAt: Date;
  metadata?: Record<string, unknown>;
}

export type EventHandler<T = unknown> = (
  event: DomainEvent<T>
) => Promise<void> | void;

export interface DomainEventBus {
  publish<T = unknown>(event: DomainEvent<T>): void;
  subscribe<T = unknown>(eventName: string, handler: EventHandler<T>): void;
  unsubscribe(eventName: string, handler: EventHandler): void;
}

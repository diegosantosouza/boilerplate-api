import type { DomainEvent } from '@/shared/events/domain-event-bus';
import { LocalEventBus } from '@/shared/events/local-event-bus';
import Log from '@/shared/logger/log';

jest.mock('@/shared/logger/log', () => ({
  __esModule: true,
  default: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

describe('LocalEventBus', () => {
  let bus: LocalEventBus;

  beforeEach(() => {
    bus = new LocalEventBus();
    jest.clearAllMocks();
  });

  it('should deliver events to subscribers', () => {
    const handler = jest.fn();
    bus.subscribe('test.event', handler);

    const event: DomainEvent = {
      name: 'test.event',
      payload: { id: '123' },
      occurredAt: new Date(),
    };

    bus.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should deliver events to multiple subscribers', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    bus.subscribe('test.event', handler1);
    bus.subscribe('test.event', handler2);

    bus.publish({
      name: 'test.event',
      payload: {},
      occurredAt: new Date(),
    });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should not deliver events to unrelated subscribers', () => {
    const handler = jest.fn();
    bus.subscribe('other.event', handler);

    bus.publish({
      name: 'test.event',
      payload: {},
      occurredAt: new Date(),
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not throw when a handler fails', () => {
    const failingHandler = jest.fn().mockImplementation(() => {
      throw new Error('boom');
    });
    bus.subscribe('test.event', failingHandler);

    expect(() =>
      bus.publish({
        name: 'test.event',
        payload: {},
        occurredAt: new Date(),
      })
    ).not.toThrow();

    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining('Handler error for test.event'),
      expect.objectContaining({ error: 'boom' })
    );
  });

  it('should support unsubscribe', () => {
    const handler = jest.fn();
    bus.subscribe('test.event', handler);
    bus.unsubscribe('test.event', handler);

    bus.publish({
      name: 'test.event',
      payload: {},
      occurredAt: new Date(),
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle same handler subscribed to different events', () => {
    const handler = jest.fn();
    bus.subscribe('event.a', handler);
    bus.subscribe('event.b', handler);

    bus.unsubscribe('event.a', handler);

    bus.publish({ name: 'event.a', payload: {}, occurredAt: new Date() });
    bus.publish({ name: 'event.b', payload: {}, occurredAt: new Date() });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

import { GcpPubSubBroker } from '@/infrastructure/messaging/gcp/gcp-pubsub-broker';
import { getGcpPubSubClient } from '@/infrastructure/messaging/gcp/gcp-pubsub-client';

jest.mock('@/infrastructure/messaging/gcp/gcp-pubsub-client', () => ({
  getGcpPubSubClient: jest.fn(),
}));

describe('GcpPubSubBroker', () => {
  const mockedGetGcpPubSubClient = jest.mocked(getGcpPubSubClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should publish a JSON payload to the configured topic', async () => {
    const publishMessage = jest.fn().mockResolvedValue('message-1');
    const topic = jest.fn().mockReturnValue({ publishMessage });

    mockedGetGcpPubSubClient.mockReturnValue({
      topic,
    } as any);

    const broker = new GcpPubSubBroker();
    const result = await broker.publish({
      destination: 'example-sync',
      payload: { id: '1' },
      attributes: { action: 'sync' },
      orderingKey: '1',
    });

    expect(topic).toHaveBeenCalledWith('example-sync');
    expect(publishMessage).toHaveBeenCalledWith({
      data: Buffer.from(JSON.stringify({ id: '1' })),
      attributes: { action: 'sync' },
      orderingKey: '1',
    });
    expect(result).toEqual({ messageId: 'message-1' });
  });

  it('should convert subscription messages into broker messages', async () => {
    let messageHandler: ((message: any) => void) | undefined;
    const on = jest.fn((event: string, handler: (message: any) => void) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    });
    const subscription = jest.fn().mockReturnValue({ on });

    mockedGetGcpPubSubClient.mockReturnValue({
      subscription,
    } as any);

    const handler = jest.fn(async message => {
      message.ack();
    });

    const broker = new GcpPubSubBroker();
    await broker.subscribe({
      destination: 'example-sync-sub',
      handler,
      maxMessages: 3,
    });

    const ack = jest.fn();
    const nack = jest.fn();

    messageHandler?.({
      id: 'message-1',
      data: Buffer.from(JSON.stringify({ id: '1' })),
      attributes: { action: 'sync' },
      ack,
      nack,
    });

    await new Promise(resolve => setImmediate(resolve));

    expect(subscription).toHaveBeenCalledWith('example-sync-sub', {
      flowControl: {
        maxMessages: 3,
        allowExcessMessages: false,
      },
    });
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'message-1',
        payload: { id: '1' },
        attributes: { action: 'sync' },
      })
    );
    expect(ack).toHaveBeenCalled();
    expect(nack).not.toHaveBeenCalled();
  });
});

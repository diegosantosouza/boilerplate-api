export interface PublishInput<TPayload = unknown> {
  destination: string;
  payload: TPayload;
  attributes?: Record<string, string>;
  orderingKey?: string;
}

export interface PublishResult {
  messageId?: string;
}

export interface BrokerMessage<TPayload = unknown> {
  id: string;
  payload: TPayload;
  attributes: Record<string, string>;
  ack(): void;
  nack(): void;
}

export interface SubscribeInput<TPayload = unknown> {
  destination: string;
  maxMessages?: number;
  handler(message: BrokerMessage<TPayload>): Promise<void>;
}

export interface MessagePublisher {
  publish<TPayload = unknown>(
    input: PublishInput<TPayload>
  ): Promise<PublishResult>;
}

export interface MessageConsumer {
  subscribe<TPayload = unknown>(input: SubscribeInput<TPayload>): Promise<void>;
}

export interface MessageBroker extends MessagePublisher, MessageConsumer {}

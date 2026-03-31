import { Queue, QueueEvents } from 'bullmq';
import {
  makeBullMqConnection,
  makeBullMqQueueOptions,
} from './bullmq-connection';

const queues = new Map<string, Queue>();
const queueEventsRegistry = new Map<string, QueueEvents>();

export const getBullMqQueue = <
  T = unknown,
  R = unknown,
  N extends string = string,
>(
  queueName: string
): Queue<T, R, N> => {
  const existingQueue = queues.get(queueName);
  if (existingQueue) {
    return existingQueue as Queue<T, R, N>;
  }

  const queue = new Queue<T, R, N>(queueName, makeBullMqQueueOptions());
  queues.set(queueName, queue);
  return queue;
};

export const getBullMqQueueEvents = (queueName: string): QueueEvents => {
  const existingQueueEvents = queueEventsRegistry.get(queueName);
  if (existingQueueEvents) {
    return existingQueueEvents;
  }

  const queueEvents = new QueueEvents(queueName, {
    connection: makeBullMqConnection(),
    prefix: makeBullMqQueueOptions().prefix,
  });
  queueEventsRegistry.set(queueName, queueEvents);
  return queueEvents;
};

export const closeBullMqResources = async (): Promise<void> => {
  await Promise.all([
    ...Array.from(queues.values()).map(queue => queue.close()),
    ...Array.from(queueEventsRegistry.values()).map(queueEvents =>
      queueEvents.close()
    ),
  ]);

  queues.clear();
  queueEventsRegistry.clear();
};

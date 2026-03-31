import { Router } from 'express';
import { z } from 'zod';
import { adaptRoute } from '@/shared/adapters';
import { registry } from '@/shared/config/openapi-registry';
import {
  EnqueueDelayedExampleBackgroundJobInputSchema,
  EnqueueExampleBackgroundJobInputSchema,
  EnqueueRetryDemoJobInputSchema,
  ExampleBackgroundJobSchedulerIdSchema,
  UpsertExampleBackgroundJobSchedulerInputSchema,
} from '../dto';
import {
  makeEnqueueDelayedExampleBackgroundJobController,
  makeEnqueueExampleBackgroundJobController,
  makeEnqueueRetryDemoJobController,
  makeListExampleBackgroundJobSchedulersController,
  makeRemoveExampleBackgroundJobSchedulerController,
  makeUpsertExampleBackgroundJobSchedulerController,
} from '../factories';

const JobSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    queueName: z.string(),
  })
  .openapi('JobSummary');

registry.registerPath({
  method: 'post',
  path: '/job-examples/immediate',
  tags: ['JobExamples'],
  summary: 'Enqueue an immediate BullMQ job example',
  request: {
    body: {
      content: {
        'application/json': {
          schema: EnqueueExampleBackgroundJobInputSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Job enqueued successfully',
      content: { 'application/json': { schema: JobSummarySchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/job-examples/delayed',
  tags: ['JobExamples'],
  summary: 'Enqueue a delayed BullMQ job example',
  request: {
    body: {
      content: {
        'application/json': {
          schema: EnqueueDelayedExampleBackgroundJobInputSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Delayed job enqueued successfully',
      content: { 'application/json': { schema: JobSummarySchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/job-examples/retry-demo',
  tags: ['JobExamples'],
  summary: 'Enqueue a retry demo BullMQ job example',
  request: {
    body: {
      content: {
        'application/json': { schema: EnqueueRetryDemoJobInputSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Retry demo job enqueued successfully',
      content: { 'application/json': { schema: JobSummarySchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/job-examples/schedulers',
  tags: ['JobExamples'],
  summary: 'List BullMQ job schedulers',
  responses: {
    200: {
      description: 'Scheduler list',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/job-examples/schedulers',
  tags: ['JobExamples'],
  summary: 'Upsert a BullMQ job scheduler',
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpsertExampleBackgroundJobSchedulerInputSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Scheduler upserted successfully',
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/job-examples/schedulers/{schedulerId}',
  tags: ['JobExamples'],
  summary: 'Remove a BullMQ job scheduler',
  request: {
    params: ExampleBackgroundJobSchedulerIdSchema,
  },
  responses: {
    200: {
      description: 'Scheduler removed successfully',
    },
  },
});

export const exampleJobRouter = Router();

exampleJobRouter.post(
  '/immediate',
  adaptRoute(makeEnqueueExampleBackgroundJobController())
);
exampleJobRouter.post(
  '/delayed',
  adaptRoute(makeEnqueueDelayedExampleBackgroundJobController())
);
exampleJobRouter.post(
  '/retry-demo',
  adaptRoute(makeEnqueueRetryDemoJobController())
);
exampleJobRouter.get(
  '/schedulers',
  adaptRoute(makeListExampleBackgroundJobSchedulersController())
);
exampleJobRouter.post(
  '/schedulers',
  adaptRoute(makeUpsertExampleBackgroundJobSchedulerController())
);
exampleJobRouter.delete(
  '/schedulers/:schedulerId',
  adaptRoute(makeRemoveExampleBackgroundJobSchedulerController())
);

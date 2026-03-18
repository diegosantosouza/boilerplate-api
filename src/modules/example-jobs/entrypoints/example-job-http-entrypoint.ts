import { Router } from 'express';
import { adaptRoute } from '@/shared/adapters';
import {
  makeEnqueueDelayedExampleBackgroundJobController,
  makeEnqueueExampleBackgroundJobController,
  makeEnqueueRetryDemoJobController,
  makeListExampleBackgroundJobSchedulersController,
  makeRemoveExampleBackgroundJobSchedulerController,
  makeUpsertExampleBackgroundJobSchedulerController,
} from '../factories';

/**
 * @swagger
 * tags:
 *   name: JobExamples
 *   description: BullMQ background jobs examples
 */

/**
 * @swagger
 * /job-examples/immediate:
 *   post:
 *     summary: Enqueue an immediate BullMQ job example
 *     tags: [JobExamples]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Run immediate job"
 *     responses:
 *       201:
 *         description: Job enqueued successfully
 *
 * /job-examples/delayed:
 *   post:
 *     summary: Enqueue a delayed BullMQ job example
 *     tags: [JobExamples]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               delayMs:
 *                 type: integer
 *                 example: 10000
 *     responses:
 *       201:
 *         description: Delayed job enqueued successfully
 *
 * /job-examples/retry-demo:
 *   post:
 *     summary: Enqueue a retry demo BullMQ job example
 *     tags: [JobExamples]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               failUntilAttempt:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Retry demo job enqueued successfully
 *
 * /job-examples/schedulers:
 *   get:
 *     summary: List BullMQ job schedulers
 *     tags: [JobExamples]
 *     responses:
 *       200:
 *         description: Scheduler list
 *   post:
 *     summary: Upsert a BullMQ job scheduler
 *     tags: [JobExamples]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedulerId:
 *                 type: string
 *               everyMs:
 *                 type: integer
 *                 example: 60000
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Scheduler upserted successfully
 *
 * /job-examples/schedulers/{schedulerId}:
 *   delete:
 *     summary: Remove a BullMQ job scheduler
 *     tags: [JobExamples]
 *     parameters:
 *       - in: path
 *         name: schedulerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduler removed successfully
 */
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

import { Router } from 'express';
import { exampleJobRouter } from '../modules/example-jobs/entrypoints';
import { itemRouter } from '../modules/items';
import { healthcheckRouter } from './healthcheck';

export const mainRouter = Router();

mainRouter.use(healthcheckRouter);

mainRouter.use('/items', itemRouter);
mainRouter.use('/job-examples', exampleJobRouter);

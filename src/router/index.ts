import { Router } from 'express';
import { itemRouter } from '../modules/items';
import { healthcheckRouter } from './healthcheck';

export const mainRouter = Router();

mainRouter.use(healthcheckRouter);

mainRouter.use('/items', itemRouter);

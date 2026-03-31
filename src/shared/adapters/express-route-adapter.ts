import type { Request, Response } from 'express';
import type { Controller } from '@/shared/protocols';

export const adaptRoute =
  (controller: Controller) => async (req: Request, res: Response) => {
    const httpResponse = await controller.handle(req);
    if (httpResponse.statusCode === 204) {
      return res.status(204).end();
    }
    res.status(httpResponse.statusCode).json(httpResponse.body);
  };

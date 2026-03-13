import { Request, Response } from 'express'
import { Controller } from '@/shared/protocols'

export const adaptRoute =
  (controller: Controller) => async (req: Request, res: Response) => {
    const httpResponse = await controller.handle(req)
    res.status(httpResponse.statusCode).json(httpResponse.body)
  }

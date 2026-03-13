import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import Log from '@/shared/logger/log'
import { formatZodError } from '@/shared/helpers'

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const extraData = err.extraData ?? err.props

  let status = err.status ? err.status : 500
  let message = err.message ? err.message : 'Internal Server Error'
  let paramsError

  if (err.name === 'ZodError') {
    status = 400
    message = 'Validation Error'
    paramsError = {
      errors: formatZodError(err),
    }
  }

  const data = {
    message,
    paramsError,
    extraData,
  }

  Log.error(`Middleware error handler -> [${status}] - ${message}`, data)
  res.status(status).json(data)
}

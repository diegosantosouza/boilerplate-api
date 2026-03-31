import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import { formatZodError } from '@/shared/helpers';
import { buildProblemDetails } from '@/shared/helpers/problem-details';
import Log from '@/shared/logger/log';

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let status = err.status || 500;
  let detail =
    (err instanceof Error ? err.message : String(err)) ||
    'Internal Server Error';
  let errors: Array<{ field: string; message: string }> | undefined;

  if (err.name === 'ZodError') {
    status = 400;
    detail = 'Validation Error';
    errors = formatZodError(err).map(({ field, message }) => ({
      field,
      message,
    }));
  }

  const problem = buildProblemDetails({
    status,
    detail,
    instance: req.originalUrl,
    errors,
  });

  Log.error(`[${status}] ${req.method} ${req.originalUrl} - ${detail}`);

  res
    .status(status)
    .setHeader('Content-Type', 'application/problem+json')
    .json(problem);
};

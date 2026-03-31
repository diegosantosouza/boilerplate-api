import { z } from 'zod';
import '@/shared/config/zod-openapi-setup';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Array<{ field: string; message: string }>;
}

export const ProblemDetailsSchema = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string(),
    instance: z.string().optional(),
    errors: z
      .array(z.object({ field: z.string(), message: z.string() }))
      .optional(),
  })
  .openapi('ProblemDetails');

const STATUS_TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

export function buildProblemDetails(params: {
  status: number;
  detail: string;
  instance?: string;
  errors?: Array<{ field: string; message: string }>;
}): ProblemDetails {
  return {
    type: `https://httpstatuses.com/${params.status}`,
    title: STATUS_TITLES[params.status] || 'Error',
    status: params.status,
    detail: params.detail,
    ...(params.instance && { instance: params.instance }),
    ...(params.errors && { errors: params.errors }),
  };
}

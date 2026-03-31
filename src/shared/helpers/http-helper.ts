import { ServerError, UnauthorizedError } from '@/shared/errors';
import {
  type DomainError,
  domainErrorToStatus,
} from '@/shared/errors/domain-errors';
import type { HttpResponse } from '@/shared/protocols/http';
import { buildProblemDetails } from './problem-details';

export const badRequest = (error: any): HttpResponse => ({
  statusCode: 400,
  body: error,
});

export const forbidden = (error: Error): HttpResponse => ({
  statusCode: 403,
  body: error,
});

export const notFound = (describe?: string): HttpResponse => ({
  statusCode: 404,
  body: describe || 'Not Found',
});

export const unauthorized = (): HttpResponse => ({
  statusCode: 401,
  body: new UnauthorizedError(),
});

export const serverError = (error: any): HttpResponse => {
  const inferedError = error as Error;
  return {
    statusCode: 500,
    body: new ServerError(inferedError.stack || ''),
  };
};

export const ok = (data?: any): HttpResponse => ({
  statusCode: 200,
  body: data,
});

export const noContent = (): HttpResponse => ({
  statusCode: 204,
  body: null,
});

export const response = (statusCode: number, body?: any): HttpResponse => ({
  statusCode,
  body,
});

export const created = (data?: any): HttpResponse => ({
  statusCode: 201,
  body: data,
});

export const domainErrorToResponse = (error: DomainError): HttpResponse => {
  const status = domainErrorToStatus(error);
  return response(
    status,
    buildProblemDetails({
      status,
      detail: error.message,
      errors: error.type === 'VALIDATION' ? error.fields : undefined,
    })
  );
};

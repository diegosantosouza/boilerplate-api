import type { NextFunction, Request, Response } from 'express';
import { errorHandlerMiddleware } from '@/shared/adapters/error-handler';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnThis();
const mockSetHeader = jest.fn().mockReturnThis();

const mockRes = {
  status: mockStatus,
  setHeader: mockSetHeader,
  json: mockJson,
} as unknown as Response;

const mockReq = {
  method: 'POST',
  originalUrl: '/api/v1/items',
} as unknown as Request;

const mockNext: NextFunction = jest.fn();

jest.mock('@/shared/logger/log', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('errorHandlerMiddleware', () => {
  it('should return RFC 7807 format for a standard error', () => {
    const err = Object.assign(new Error('Item not found'), { status: 404 });

    errorHandlerMiddleware(err, mockReq, mockRes, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/problem+json'
    );
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Item not found',
        instance: '/api/v1/items',
      })
    );
  });

  it('should default to 500 when error has no status', () => {
    const err = new Error('Unexpected failure');

    errorHandlerMiddleware(err, mockReq, mockRes, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        title: 'Internal Server Error',
        detail: 'Unexpected failure',
      })
    );
  });

  it('should handle ZodError with validation errors', () => {
    const zodError = {
      name: 'ZodError',
      message: 'Validation failed',
      format: () => ({
        _errors: [],
        name: { _errors: ['Required'] },
      }),
    };

    errorHandlerMiddleware(zodError, mockReq, mockRes, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        title: 'Bad Request',
        detail: 'Validation Error',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'name', message: 'Required' }),
        ]),
      })
    );
  });

  it('should handle non-Error objects gracefully', () => {
    const err = 'plain string error';

    errorHandlerMiddleware(err, mockReq, mockRes, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        detail: 'plain string error',
      })
    );
  });

  it('should set Content-Type to application/problem+json', () => {
    const err = new Error('test');

    errorHandlerMiddleware(err, mockReq, mockRes, mockNext);

    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/problem+json'
    );
  });
});

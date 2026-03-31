import type { NextFunction, Request, Response } from 'express';
import type { AuditLogger } from '@/shared/audit/audit-logger';
import { createAuditMiddleware } from '@/shared/middlewares/audit.middleware';

describe('Audit Middleware', () => {
  let mockAuditLogger: jest.Mocked<AuditLogger>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let finishCallback: (() => void) | undefined;

  beforeEach(() => {
    mockAuditLogger = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    mockReq = {
      method: 'POST',
      originalUrl: '/items',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any,
      get: jest.fn().mockReturnValue('test-agent'),
      authUser: { userId: 'user-123' },
    };

    mockRes = {
      statusCode: 201,
      on: jest.fn().mockImplementation((event: string, cb: () => void) => {
        if (event === 'finish') {
          finishCallback = cb;
        }
      }),
    };

    mockNext = jest.fn();
    finishCallback = undefined;
  });

  it('should call next for non-mutation methods', () => {
    mockReq.method = 'GET';
    const middleware = createAuditMiddleware(mockAuditLogger);

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.on).not.toHaveBeenCalled();
  });

  it('should register finish listener and call next for mutation methods', () => {
    const middleware = createAuditMiddleware(mockAuditLogger);

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should log audit entry on response finish', () => {
    const middleware = createAuditMiddleware(mockAuditLogger);

    middleware(mockReq as Request, mockRes as Response, mockNext);
    finishCallback?.();

    expect(mockAuditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        action: 'CREATE',
        resource: 'items',
        resourceId: null,
        method: 'POST',
        path: '/items',
        statusCode: 201,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      })
    );
  });

  it('should extract resourceId from URL', () => {
    mockReq.method = 'PUT';
    mockReq.originalUrl = '/items/abc-123';
    const middleware = createAuditMiddleware(mockAuditLogger);

    middleware(mockReq as Request, mockRes as Response, mockNext);
    finishCallback?.();

    expect(mockAuditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE',
        resource: 'items',
        resourceId: 'abc-123',
      })
    );
  });

  it('should strip query params from URL when extracting resource', () => {
    mockReq.originalUrl = '/items?page=1&limit=10';
    const middleware = createAuditMiddleware(mockAuditLogger);

    middleware(mockReq as Request, mockRes as Response, mockNext);
    finishCallback?.();

    expect(mockAuditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: 'items',
        resourceId: null,
        path: '/items?page=1&limit=10',
      })
    );
  });

  it('should handle DELETE method as DELETE action', () => {
    mockReq.method = 'DELETE';
    mockReq.originalUrl = '/items/abc-123';
    const middleware = createAuditMiddleware(mockAuditLogger);

    middleware(mockReq as Request, mockRes as Response, mockNext);
    finishCallback?.();

    expect(mockAuditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE',
        resource: 'items',
        resourceId: 'abc-123',
      })
    );
  });

  it('should handle PATCH method as UPDATE action', () => {
    mockReq.method = 'PATCH';
    const middleware = createAuditMiddleware(mockAuditLogger);

    middleware(mockReq as Request, mockRes as Response, mockNext);
    finishCallback?.();

    expect(mockAuditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE',
      })
    );
  });

  it('should set userId to null when not authenticated', () => {
    mockReq.authUser = undefined;
    const middleware = createAuditMiddleware(mockAuditLogger);

    middleware(mockReq as Request, mockRes as Response, mockNext);
    finishCallback?.();

    expect(mockAuditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
      })
    );
  });
});

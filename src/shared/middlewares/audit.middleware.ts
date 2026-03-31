import type { NextFunction, Request, Response } from 'express';
import type { AuditLogger } from '@/shared/audit/audit-logger';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function resolveAction(method: string): string {
  const map: Record<string, string> = {
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE',
  };
  return map[method] || method;
}

function extractResourceInfo(originalUrl: string): {
  resource: string;
  resourceId: string | null;
} {
  const path = originalUrl.split('?')[0];
  const parts = path.split('/').filter(Boolean);
  const resource = parts[0] || 'unknown';
  const resourceId = parts[1] || null;
  return { resource, resourceId };
}

export function createAuditMiddleware(auditLogger: AuditLogger) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!MUTATION_METHODS.has(req.method)) {
      next();
      return;
    }

    const startTime = Date.now();

    res.on('finish', () => {
      const { resource, resourceId } = extractResourceInfo(req.originalUrl);

      auditLogger
        .log({
          timestamp: new Date(),
          userId: req.authUser?.userId || null,
          action: resolveAction(req.method),
          resource,
          resourceId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          ip: req.ip || req.socket.remoteAddress || 'unknown',
          userAgent: req.get('user-agent') || 'unknown',
          duration: Date.now() - startTime,
        })
        .catch(() => {});
    });

    next();
  };
}

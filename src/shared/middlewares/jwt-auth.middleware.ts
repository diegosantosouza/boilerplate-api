import type { NextFunction, Request, Response } from 'express';
import Log from '@/shared/logger/log';

export interface AuthUser {
  userId: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export const jwtAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = decodeJwtPayload(token);

  if (!payload) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  const userId = payload.sub || payload.userId || payload.id;
  if (!userId) {
    Log.warn(
      JSON.stringify({
        event: '[jwtAuthMiddleware:noUserId]',
        data: { keys: Object.keys(payload) },
      })
    );
    res.status(401).json({ message: 'Invalid token claims' });
    return;
  }

  req.authUser = { userId: String(userId), email: payload.email };
  next();
};

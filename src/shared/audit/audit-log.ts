export interface AuditEntry {
  timestamp: Date;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  method: string;
  path: string;
  statusCode: number;
  ip: string;
  userAgent: string;
  duration: number;
}

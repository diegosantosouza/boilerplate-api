import type { AuditEntry } from './audit-log';

export interface AuditLogger {
  log(entry: AuditEntry): Promise<void>;
}

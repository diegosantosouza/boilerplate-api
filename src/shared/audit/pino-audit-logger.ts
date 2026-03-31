import Log from '@/shared/logger/log';
import type { AuditEntry } from './audit-log';
import type { AuditLogger } from './audit-logger';

export class PinoAuditLogger implements AuditLogger {
  async log(entry: AuditEntry): Promise<void> {
    Log.info('AUDIT', {
      audit: true,
      ...entry,
    });
  }
}

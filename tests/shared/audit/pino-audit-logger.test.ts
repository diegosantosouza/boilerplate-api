import type { AuditEntry } from '@/shared/audit/audit-log';
import { PinoAuditLogger } from '@/shared/audit/pino-audit-logger';
import Log from '@/shared/logger/log';

jest.mock('@/shared/logger/log', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
  },
}));

describe('PinoAuditLogger', () => {
  const auditLogger = new PinoAuditLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log audit entry via Log.info with audit flag', async () => {
    const entry: AuditEntry = {
      timestamp: new Date('2026-03-30T00:00:00Z'),
      userId: 'user-1',
      action: 'CREATE',
      resource: 'items',
      resourceId: null,
      method: 'POST',
      path: '/items',
      statusCode: 201,
      ip: '127.0.0.1',
      userAgent: 'test-agent',
      duration: 42,
    };

    await auditLogger.log(entry);

    expect(Log.info).toHaveBeenCalledWith('AUDIT', {
      audit: true,
      ...entry,
    });
  });
});

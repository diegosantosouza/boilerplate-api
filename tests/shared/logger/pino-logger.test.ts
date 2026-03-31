import type pino from 'pino';
import { PinoLogger } from '@/shared/logger/pino-logger';

describe('PinoLogger', () => {
  let mockPinoInstance: jest.Mocked<pino.Logger>;
  let logger: PinoLogger;

  beforeEach(() => {
    mockPinoInstance = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    } as unknown as jest.Mocked<pino.Logger>;

    logger = new PinoLogger(mockPinoInstance);
  });

  it('should call pino error with context', () => {
    logger.error('something failed', { code: 500 });
    expect(mockPinoInstance.error).toHaveBeenCalledWith(
      { code: 500 },
      'something failed'
    );
  });

  it('should call pino error with empty object when no context', () => {
    logger.error('something failed');
    expect(mockPinoInstance.error).toHaveBeenCalledWith({}, 'something failed');
  });

  it('should call pino warn with context', () => {
    logger.warn('deprecation', { feature: 'old-api' });
    expect(mockPinoInstance.warn).toHaveBeenCalledWith(
      { feature: 'old-api' },
      'deprecation'
    );
  });

  it('should call pino info with context', () => {
    logger.info('server started', { port: 3000 });
    expect(mockPinoInstance.info).toHaveBeenCalledWith(
      { port: 3000 },
      'server started'
    );
  });

  it('should call pino debug with context', () => {
    logger.debug('cache hit', { key: 'items:1' });
    expect(mockPinoInstance.debug).toHaveBeenCalledWith(
      { key: 'items:1' },
      'cache hit'
    );
  });

  it('should create a child logger with bindings', () => {
    const mockChildInstance = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    } as unknown as pino.Logger;

    mockPinoInstance.child.mockReturnValue(mockChildInstance);

    const childLogger = logger.child({ requestId: 'abc-123' });

    expect(mockPinoInstance.child).toHaveBeenCalledWith({
      requestId: 'abc-123',
    });
    expect(childLogger).toBeInstanceOf(PinoLogger);
  });

  it('should expose the underlying pino instance', () => {
    expect(logger.instance).toBe(mockPinoInstance);
  });

  it('child logger should delegate calls to child pino instance', () => {
    const mockChildInstance = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    } as unknown as jest.Mocked<pino.Logger>;

    mockPinoInstance.child.mockReturnValue(mockChildInstance);

    const childLogger = logger.child({ requestId: 'abc-123' });
    childLogger.info('handling request', { path: '/items' });

    expect(mockChildInstance.info).toHaveBeenCalledWith(
      { path: '/items' },
      'handling request'
    );
  });
});

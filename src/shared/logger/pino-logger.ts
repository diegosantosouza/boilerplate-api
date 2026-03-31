import pino, { type Logger as PinoInstance } from 'pino';
import { env } from '@/shared/config/env';
import type { LogContext, LoggerPort } from './logger-port';

export class PinoLogger implements LoggerPort {
  private logger: PinoInstance;

  constructor(instance?: PinoInstance) {
    this.logger =
      instance ??
      pino({
        level: env.log_level,
        ...(env.node_env === 'development' && {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true },
          },
        }),
      });
  }

  get instance(): PinoInstance {
    return this.logger;
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(context ?? {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }

  child(bindings: LogContext): LoggerPort {
    return new PinoLogger(this.logger.child(bindings));
  }
}

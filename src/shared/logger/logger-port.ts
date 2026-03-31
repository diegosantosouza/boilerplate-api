export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerPort {
  error(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  child(bindings: LogContext): LoggerPort;
}

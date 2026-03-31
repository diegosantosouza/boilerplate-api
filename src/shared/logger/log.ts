import type { LoggerPort } from './logger-port';
import { PinoLogger } from './pino-logger';

const pinoLogger = new PinoLogger();

const Log: LoggerPort = pinoLogger;
export default Log;

export const pinoInstance = pinoLogger.instance;

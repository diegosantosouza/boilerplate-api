const logLevel = (process.env.LOG_LEVEL?.toLowerCase() as string) || 'debug';

const levels: Record<string, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = levels[logLevel] ?? 3;

const Log = {
  error(message: string, ...args: any[]) {
    if (currentLevel >= levels.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  warn(message: string, ...args: any[]) {
    if (currentLevel >= levels.warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  info(message: string, ...args: any[]) {
    if (currentLevel >= levels.info) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  debug(message: string, ...args: any[]) {
    if (currentLevel >= levels.debug) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

export default Log;

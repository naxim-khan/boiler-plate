// pino/winston setup
import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';

const loggerOptions: Parameters<typeof pino>[0] = {
  level: logLevel,
};

if (process.env.NODE_ENV !== 'production') {
  Object.assign(loggerOptions, {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  });
}

const logger = pino(loggerOptions);

export default logger;

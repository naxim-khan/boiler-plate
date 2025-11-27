import pino from 'pino';
import { createStream } from 'rotating-file-stream';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const logFilename = 'app.log';
const isProd = process.env.NODE_ENV === 'production';

// Create rotating stream for production
const rotatingStream = createStream(logFilename, {
  interval: '1d',    // daily rotation
  size: '10M',       // rotate after 10MB
  compress: 'gzip',
  path: logsDir,
});

// Logger configuration
const logger = isProd
  ? pino(
      {
        level: 'info',
        redact: ['password', 'token'],
      },
      rotatingStream // direct stream works in Pino v8+
    )
  : pino(
      {
        level: 'debug',
        redact: ['password', 'token'],
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      }
    );

export default logger;

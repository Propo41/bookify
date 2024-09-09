import { createLogger, format, LoggerOptions, transports } from 'winston';
const { combine, timestamp, printf, colorize, metadata, prettyPrint } = format;

const logFormat = printf(({ level, message, metadata }) => {
  return `${metadata.timestamp} [${level}]: ${message} ${JSON.stringify(metadata.metadata)}}`;
});

const loggerInstance: LoggerOptions = {
  level: 'info',
  format: combine(metadata(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
  defaultMeta: {
    service: 'BookifyApp',
  },
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), metadata(), prettyPrint(), logFormat),
    }),
    new transports.File({
      dirname: 'logs',
      filename: 'error.log',
      level: 'error',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), metadata(), logFormat),
    }),
    new transports.File({
      dirname: 'logs',
      filename: 'combined.log',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), metadata(), logFormat),
    }),
  ],
};

export const winstonInstance = createLogger(loggerInstance);

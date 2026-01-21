import winston from 'winston';

export const consoleLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    defaultMeta: { service: 'console-service' },
    transports: [
        new winston.transports.Console()
    ],
});


export const fileLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    defaultMeta: { service: 'file-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or higher to `error.log`
        //   (i.e., error, fatal, but not other levels)
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //
        // - Write all logs with importance level of `info` or higher to `combined.log`
        //   (i.e., fatal, error, warn, and info, but not trace)
        //
        new winston.transports.File({ filename: 'combined.log' }),

        //new winston.transports.Console()
    ],
});
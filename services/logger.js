/**
 * Production Logger
 * Structured logging with multiple transports
 */

const pino = require('pino');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        env: process.env.NODE_ENV || 'development',
        service: 'alignai-backend'
    }
});

// Wrapper for easier usage
const loggerWrapper = {
    info: (msg, ...args) => logger.info(...args, msg),
    error: (msg, error, ...args) => {
        if (error instanceof Error) {
            logger.error({ ...args, err: error }, msg);
        } else {
            logger.error({ ...args, error }, msg);
        }
    },
    warn: (msg, ...args) => logger.warn(...args, msg),
    debug: (msg, ...args) => logger.debug(...args, msg),

    // Special methods
    apiRequest: (req) => {
        logger.info({
            type: 'api_request',
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('user-agent')
        }, 'API Request');
    },

    apiResponse: (req, res, duration) => {
        logger.info({
            type: 'api_response',
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        }, 'API Response');
    }
};

module.exports = loggerWrapper;

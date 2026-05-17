/**
 * Production Middleware
 * Security, rate limiting, logging, error handling
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const logger = require('../services/logger');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    logger.apiRequest(req);

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.apiResponse(req, res, duration);
    });

    next();
};

/**
 * Rate limiting
 */
const createRateLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: options.max || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        message: {
            success: false,
            error: 'Too many requests, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
            res.status(429).json({
                success: false,
                error: 'Too many requests, please try again later.'
            });
        }
    });
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error:', err, {
        method: req.method,
        url: req.url,
        body: req.body
    });

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';

    res.status(err.statusCode || 500).json({
        success: false,
        error: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    });
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Validation middleware
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors
            });
        }
    };
};

module.exports = {
    requestLogger,
    createRateLimiter,
    errorHandler,
    notFoundHandler,
    asyncHandler,
    validateRequest,
    helmet: helmet()
};

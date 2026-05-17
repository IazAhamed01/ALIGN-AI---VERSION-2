/**
 * Redis Cache Configuration
 * Provides caching layer for performance optimization
 */

require('dotenv').config();
const Redis = require('ioredis');
const logger = require('../services/logger');

class CacheConfig {
    constructor() {
        this.isConnected = false;
        this.initialize();
    }

    initialize() {
        // Check if Redis is disabled in env
        if (process.env.REDIS_URL === 'disabled' || process.env.REDIS_URL === 'none') {
            console.log('ℹ️  Redis cache disabled - app will work without caching');
            this.client = null;
            return;
        }

        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            let errorShown = false;

            this.client = new Redis(redisUrl, {
                retryStrategy() {
                    // Don't retry - just fail silently
                    return null;
                },
                maxRetriesPerRequest: 1,
                enableReadyCheck: true,
                lazyConnect: true,
                showFriendlyErrorStack: false
            });

            this.client.on('connect', () => {
                this.isConnected = true;
                console.log('✅ Redis cache connected');
            });

            this.client.on('error', (err) => {
                this.isConnected = false;
                // Only show error once
                if (!errorShown) {
                    console.warn('⚠️  Redis not available - continuing without cache');
                    errorShown = true;
                }
                // Silently ignore subsequent errors
            });

            // Attempt to connect
            this.client.connect().catch(err => {
                if (!errorShown) {
                    console.log('ℹ️  Redis not available - app will work without caching');
                    errorShown = true;
                }
                this.client = null;
            });

        } catch (error) {
            console.log('ℹ️  Redis disabled - app will work without caching');
            this.client = null;
        }
    }

    /**
     * Get value from cache
     */
    async get(key) {
        if (!this.isConnected || !this.client) {
            return null;
        }

        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set(key, value, ttl = null) {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const serialized = JSON.stringify(value);
            const defaultTTL = parseInt(process.env.REDIS_TTL) || 3600;

            if (ttl) {
                await this.client.setex(key, ttl, serialized);
            } else {
                await this.client.setex(key, defaultTTL, serialized);
            }

            return true;
        } catch (error) {
            logger.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Delete key from cache
     */
    async del(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            logger.error('Cache delete error:', error);
            return false;
        }
    }

    /**
     * Clear all cache
     */
    async flush() {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            await this.client.flushdb();
            return true;
        } catch (error) {
            logger.error('Cache flush error:', error);
            return false;
        }
    }

    /**
     * Cache wrapper function
     */
    async wrap(key, fn, ttl = null) {
        // Try to get from cache
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Execute function
        const result = await fn();

        // Cache result
        await this.set(key, result, ttl);

        return result;
    }

    /**
     * Get or set with automatic key prefix
     */
    generateKey(namespace, ...parts) {
        return `alignai:${namespace}:${parts.join(':')}`;
    }
}

module.exports = new CacheConfig();

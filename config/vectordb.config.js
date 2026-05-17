/**
 * Vector Database Configuration
 * Supports Pinecone (cloud) - ChromaDB removed due to dependency conflicts
 * The app works without vector database - AI features use direct LLM calls
 */

require('dotenv').config();

// Try to load Pinecone - it's optional
let Pinecone;
try {
    const pineconeModule = require('@pinecone-database/pinecone');
    Pinecone = pineconeModule.Pinecone;
} catch (error) {
    console.warn('⚠️  Pinecone not installed - vector database features disabled');
}

const VECTOR_DB_PROVIDER = process.env.VECTOR_DB_PROVIDER || 'none'; // 'pinecone' or 'none'

class VectorDBConfig {
    constructor() {
        this.provider = VECTOR_DB_PROVIDER;
        this.isInitialized = false;
        this.initialize();
    }

    async initialize() {
        try {
            if (this.provider === 'pinecone' && Pinecone) {
                await this.initializePinecone();
            } else {
                console.log('ℹ️  Vector database disabled - using direct LLM calls for AI features');
            }
            this.isInitialized = true;
        } catch (error) {
            console.error('Vector DB initialization error:', error.message);
            // Don't throw - allow app to start without vector DB
        }
    }

    async initializePinecone() {
        if (!process.env.PINECONE_API_KEY) {
            console.warn('⚠️  Pinecone API key not found, skipping initialization');
            return;
        }

        try {
            this.pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY
            });

            this.indexName = process.env.PINECONE_INDEX_NAME || 'agricultural-knowledge';
            this.index = this.pinecone.index(this.indexName);
            console.log('✅ Pinecone initialized successfully');
        } catch (error) {
            console.error('Failed to connect to Pinecone index:', error.message);
        }
    }

    /**
     * Upsert vectors into the database
     */
    async upsert(vectors) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.provider === 'pinecone' && this.index) {
            return await this.upsertPinecone(vectors);
        }

        console.warn('⚠️  Vector database not available - skipping upsert');
        return { success: false, count: 0, message: 'Vector DB not configured' };
    }

    async upsertPinecone(vectors) {
        const records = vectors.map((v, idx) => ({
            id: v.id || `vec-${Date.now()}-${idx}`,
            values: v.embedding,
            metadata: v.metadata
        }));

        await this.index.upsert(records);
        return { success: true, count: records.length };
    }

    /**
     * Query similar vectors
     */
    async query(embedding, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const topK = options.topK || 5;
        const filter = options.filter || {};

        if (this.provider === 'pinecone' && this.index) {
            return await this.queryPinecone(embedding, topK, filter);
        }

        return [];
    }

    async queryPinecone(embedding, topK, filter) {
        const queryResponse = await this.index.query({
            vector: embedding,
            topK,
            filter,
            includeMetadata: true
        });

        return queryResponse.matches.map(match => ({
            id: match.id,
            score: match.score,
            metadata: match.metadata
        }));
    }

    /**
     * Delete vectors
     */
    async delete(ids) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.provider === 'pinecone' && this.index) {
            await this.index.deleteMany(ids);
            return { success: true };
        }

        return { success: false };
    }

}

module.exports = new VectorDBConfig();

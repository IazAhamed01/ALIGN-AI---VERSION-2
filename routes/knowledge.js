/**
 * Knowledge Management Routes
 * Manage RAG knowledge base
 */

const express = require('express');
const router = express.Router();
const ragService = require('../services/rag.service');
const logger = require('../services/logger');

/**
 * POST /api/knowledge/index
 * Index new knowledge into vector database
 */
router.post('/index', async (req, res) => {
    try {
        const { documents } = req.body;

        if (!documents || !Array.isArray(documents)) {
            return res.status(400).json({
                success: false,
                error: 'documents array is required'
            });
        }

        logger.info(`Indexing ${documents.length} documents`);

        const result = await ragService.indexKnowledge(documents);

        res.json({
            success: true,
            data: {
                indexed_count: result.count,
                message: 'Knowledge indexed successfully'
            }
        });

    } catch (error) {
        logger.error('Knowledge indexing error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/knowledge/query
 * Query knowledge base
 */
router.post('/query', async (req, res) => {
    try {
        const { question, options = {} } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                error: 'question is required'
            });
        }

        const result = await ragService.queryKnowledgeBase(question, options);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('Knowledge query error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/knowledge/health
 * Check knowledge base health
 */
router.get('/health', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                status: 'operational',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Knowledge health check error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

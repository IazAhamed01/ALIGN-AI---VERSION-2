require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routes
const forecastRoutes = require('./routes/forecast');
const dataRoutes = require('./routes/data');
const aiForecastRoutes = require('./routes/aiForecast');
const knowledgeRoutes = require('./routes/knowledge');

// Middleware
const {
  requestLogger,
  createRateLimiter,
  errorHandler,
  notFoundHandler,
  helmet
} = require('./middleware/production.middleware');

const logger = require('./services/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet);

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
const generalLimiter = createRateLimiter({ max: 1000, windowMs: 15 * 60 * 1000 });
const aiLimiter = createRateLimiter({ max: 1000, windowMs: 15 * 60 * 1000 });

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/ai-forecast', aiLimiter);
app.use('/api/knowledge', aiLimiter);

// Routes
app.use('/api/forecast', forecastRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ai-forecast', aiForecastRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    ai_enabled: true
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AlignAI - Agricultural Coordination API',
    version: '2.0.0',
    description: 'AI-Powered coordination layer for harvest forecasting, logistics, and storage with LLM and RAG',
    endpoints: {
      forecast: {
        dashboard: 'POST /api/forecast/dashboard',
        harvest: 'POST /api/forecast/harvest',
        logistics: 'POST /api/forecast/logistics',
        storage: 'POST /api/forecast/storage'
      },
      ai_forecast: {
        dashboard: 'POST /api/ai-forecast/dashboard - AI-Enhanced Dashboard',
        query: 'POST /api/ai-forecast/query - Natural Language Query',
        advisory: 'POST /api/ai-forecast/advisory - AI-Powered Advisory',
        analyze: 'POST /api/ai-forecast/analyze - Deep Analysis',
        chat: 'POST /api/ai-forecast/chat - Interactive Chat'
      },
      knowledge: {
        index: 'POST /api/knowledge/index - Index Knowledge',
        query: 'POST /api/knowledge/query - Query Knowledge Base',
        health: 'GET /api/knowledge/health - Knowledge Base Health'
      },
      data: {
        crops: 'GET /api/data/crops',
        regions: 'GET /api/data/regions',
        storage: 'GET /api/data/storage',
        farmers: 'GET/POST /api/data/farmers'
      }
    },
    features: [
      'AI-Enhanced Forecasting',
      'RAG-Powered Advisories',
      'Natural Language Queries',
      'Intelligent Risk Analysis',
      'Real-time Optimization',
      'Production-Ready Infrastructure'
    ]
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Only start server when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🌾 AlignAI Backend API v2.0 (AI-Powered) running on http://localhost:${PORT}`);
    console.log(`📊 AI Dashboard: POST http://localhost:${PORT}/api/ai-forecast/dashboard`);
    console.log(`💬 AI Chat: POST http://localhost:${PORT}/api/ai-forecast/chat`);
    console.log(`🏥 Health: GET http://localhost:${PORT}/health\n`);
    logger.info('Server started successfully');
  });
}

// Export for Vercel serverless
module.exports = app;

/**
 * AI-Enhanced Forecast Routes
 * Integrates LLM and RAG for intelligent forecasting
 */

const express = require('express');
const router = express.Router();

const { computeHarvestForecast, aggregateForecasts } = require('../engine/harvestForecast');
const { assessLogistics } = require('../engine/logisticsStress');
const { assessStorageAllocation, aggregateStorageFacilities } = require('../engine/storageAllocation');
const { crops, regions, farmers, storageFacilities, weatherData } = require('../data/sampleData');

const aiForecastService = require('../services/aiForecast.service');
const ragService = require('../services/rag.service');
const cache = require('../config/cache.config');
const logger = require('../services/logger');

/**
 * POST /api/ai-forecast/dashboard
 * AI-Enhanced unified dashboard with intelligent insights
 */
router.post('/dashboard', async (req, res) => {
    const startTime = Date.now();

    try {
        const { farmer_id, weather_deviation, enable_ai = true } = req.body;

        // Check cache first
        const cacheKey = cache.generateKey('forecast', 'dashboard', farmer_id || 'all', weather_deviation || 'default');
        const cached = await cache.get(cacheKey);

        if (cached && enable_ai) {
            logger.info('Returning cached AI-enhanced forecast');
            return res.json(cached);
        }

        // Get base data
        const region = regions[0];
        const crop = crops[0];
        const weather = weatherData[region.region_id];
        const weatherFlag = weather_deviation !== undefined ? weather_deviation : weather.deviation_flag;

        // Determine target farmers
        let targetFarmers;
        if (farmer_id) {
            targetFarmers = farmers.filter(f => f.farmer_id === farmer_id);
            if (targetFarmers.length === 0) {
                return res.status(404).json({ success: false, error: 'Farmer not found' });
            }
        } else {
            targetFarmers = farmers;
        }

        // Step 1: Compute harvest forecasts
        const farmerForecasts = targetFarmers.map(farmer => {
            const forecast = computeHarvestForecast({
                sowingDate: farmer.sowing_date,
                avgMaturityDays: crop.avg_maturity_days,
                cultivatedArea: farmer.cultivated_area,
                avgYieldPerHectare: crop.avg_yield_per_hectare,
                farmerReadinessScore: farmer.readiness_score,
                weatherDeviationFlag: weatherFlag,
                transportCapacity: region.transport_capacity_per_day
            });

            return {
                farmer_id: farmer.farmer_id,
                farmer_name: farmer.name,
                ...forecast
            };
        });

        const aggregated = aggregateForecasts(farmerForecasts);
        const totalVolume = aggregated.total_forecasted_volume;

        // Step 2: Assess logistics
        const logistics = assessLogistics({
            forecastedVolume: totalVolume,
            transportCapacity: region.transport_capacity_per_day,
            regionId: region.region_id
        });

        // Step 3: Assess storage
        const aggregatedStorage = aggregateStorageFacilities(storageFacilities);
        const storage = assessStorageAllocation({
            forecastedVolume: totalVolume,
            transportCapacity: region.transport_capacity_per_day,
            totalStorageCapacity: aggregatedStorage.total_capacity,
            currentStorageUsage: aggregatedStorage.total_usage
        });

        // Determine overall harvest level
        let overallHarvestLevel;
        if (totalVolume < 0.7 * region.transport_capacity_per_day) {
            overallHarvestLevel = 'LOW';
        } else if (totalVolume <= region.transport_capacity_per_day) {
            overallHarvestLevel = 'MEDIUM';
        } else {
            overallHarvestLevel = 'HIGH';
        }

        // Combine all advisories
        const allAdvisories = [
            ...logistics.advisories,
            ...storage.advisories
        ];

        // Build base response
        let baseResponse = {
            crop: crop.crop_type,
            region: region.name,
            forecast_window: 5,
            generated_at: new Date().toISOString(),
            summary: {
                harvest_level: overallHarvestLevel,
                forecasted_harvest_volume: totalVolume,
                logistics_stress_level: logistics.logistics_stress_level,
                storage_action: storage.allocation_decision.storage_action,
                storage_reserve_percentage: storage.allocation_decision.storage_reserve_percentage
            },
            weather: {
                condition: weatherFlag === 0 ? 'Normal' : (weatherFlag === 1 ? 'Favorable' : 'Adverse'),
                deviation_flag: weatherFlag,
                forecast: weather.forecast
            },
            harvest_forecast: aggregated,
            logistics_assessment: {
                alert: logistics.logistics_alert,
                stress_level: logistics.logistics_stress_level,
                utilization_ratio: logistics.utilization_ratio,
                transport_capacity: logistics.transport_capacity,
                excess_volume: logistics.excess_volume,
                staging_locations: logistics.staging_locations
            },
            storage_assessment: {
                facilities: aggregatedStorage,
                allocation: storage.allocation_decision,
                demand: storage.demand_forecast
            },
            advisories: allAdvisories,
            total_forecasted_volume: totalVolume,
            total_storage_capacity: aggregatedStorage.total_capacity,
            current_storage_usage: aggregatedStorage.total_usage,
            storage_utilization_percentage: (aggregatedStorage.total_usage / aggregatedStorage.total_capacity * 100).toFixed(2)
        };

        // Step 4: AI Enhancement (if enabled)
        if (enable_ai) {
            try {
                baseResponse = await aiForecastService.enhanceForecast(baseResponse);

                // Generate intelligent advisories
                const aiAdvisories = await aiForecastService.generateIntelligentAdvisories(baseResponse);
                baseResponse.ai_advisories = aiAdvisories;

            } catch (error) {
                logger.error('AI enhancement failed, returning base forecast:', error);
                baseResponse.ai_note = 'AI enhancements unavailable';
            }
        }

        const response = {
            success: true,
            data: baseResponse,
            metadata: {
                ai_enhanced: enable_ai,
                processing_time_ms: Date.now() - startTime
            }
        };

        // Cache the result
        await cache.set(cacheKey, response, 300); // Cache for 5 minutes

        logger.info(`Dashboard generated in ${Date.now() - startTime}ms`);
        res.json(response);

    } catch (error) {
        logger.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/ai-forecast/query
 * Natural language query interface
 */
router.post('/query', async (req, res) => {
    try {
        const { question, context, language = 'en' } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                error: 'Question is required'
            });
        }

        logger.info('Processing natural language query:', { question, language });

        // Add language instruction if not English
        let enhancedQuestion = question;
        if (language !== 'en') {
            const languageNames = {
                'hi': 'Hindi (हिंदी)',
                'ta': 'Tamil (தமிழ்)',
                'te': 'Telugu (తెలుగు)',
                'kn': 'Kannada (ಕನ್ನಡ)',
                'mr': 'Marathi (मराठी)',
                'bn': 'Bengali (বাংলা)'
            };
            enhancedQuestion = `${question}\n\nPlease respond in ${languageNames[language] || language}.`;
        }

        const result = await ragService.queryKnowledgeBase(enhancedQuestion, {
            topK: 5
        });

        res.json({
            success: true,
            data: {
                question,
                answer: result.response,
                language,
                sources: result.sources,
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Query error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/ai-forecast/advisory
 * Generate AI-powered advisory
 */
router.post('/advisory', async (req, res) => {
    try {
        const { forecast_data, advisory_type } = req.body;

        if (!forecast_data || !advisory_type) {
            return res.status(400).json({
                success: false,
                error: 'forecast_data and advisory_type are required'
            });
        }

        logger.info('Generating AI advisory:', { advisory_type });

        const advisory = await ragService.generateAdvisory(forecast_data, advisory_type);

        res.json({
            success: true,
            data: {
                type: advisory_type,
                advisory: advisory.response,
                sources: advisory.sources,
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Advisory generation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/ai-forecast/analyze
 * Deep analysis of forecast data
 */
router.post('/analyze', async (req, res) => {
    try {
        const { forecast_data, analysis_type = 'comprehensive' } = req.body;

        if (!forecast_data) {
            return res.status(400).json({
                success: false,
                error: 'forecast_data is required'
            });
        }

        const insights = await aiForecastService.generateHarvestInsights(forecast_data);
        const risks = await aiForecastService.generateRiskAnalysis(forecast_data);
        const optimizations = await aiForecastService.generateOptimizationSuggestions(forecast_data);

        res.json({
            success: true,
            data: {
                insights,
                risks,
                optimizations,
                analysis_type,
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Analysis error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/ai-forecast/chat
 * Interactive chat about forecast data
 */
router.post('/chat', async (req, res) => {
    try {
        const { question, forecast_data } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                error: 'question is required'
            });
        }

        const answer = await aiForecastService.queryForecast(question, forecast_data || {});

        res.json({
            success: true,
            data: answer
        });

    } catch (error) {
        logger.error('Chat error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/ai-forecast/contextual-query
 * Context-aware AI query for specific domains (farmers, storage, logistics)
 */
router.post('/contextual-query', async (req, res) => {
    try {
        const { question, context, language = 'en' } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                error: 'Question is required'
            });
        }

        logger.info('Processing contextual query:', { question, domain: context?.domain, language });

        // Build context-aware prompt
        let enhancedPrompt = question;

        if (context) {
            const { domain, cropType, harvestDate, location, storageType, capacity,
                currentStock, transportType, route, volume, commodity } = context;

            // Add domain-specific context
            if (domain === 'farmers' && cropType) {
                enhancedPrompt = `
Context: I am a farmer growing ${cropType} in ${location || 'my region'}.
${harvestDate ? `My expected harvest date is ${harvestDate}.` : ''}

Question: ${question}

Please provide specific, actionable advice for my situation.`;
            }
            else if (domain === 'storage' && storageType) {
                enhancedPrompt = `
Context: I manage a ${storageType} facility with ${capacity || 'limited'} capacity.
${currentStock ? `Current stock: ${currentStock} units of ${commodity || 'produce'}.` : ''}

Question: ${question}

Please provide storage optimization advice for my situation.`;
            }
            else if (domain === 'logistics' && transportType) {
                enhancedPrompt = `
Context: I handle logistics using ${transportType} for transporting ${commodity || 'agricultural produce'}.
${route ? `Route: ${route}.` : ''}
${volume ? `Volume: ${volume} tonnes.` : ''}

Question: ${question}

Please provide logistics optimization advice for my situation.`;
            }
        }

        // Add language instruction if not English
        if (language !== 'en') {
            const languageNames = {
                'hi': 'Hindi',
                'ta': 'Tamil',
                'te': 'Telugu',
                'kn': 'Kannada',
                'mr': 'Marathi',
                'bn': 'Bengali'
            };
            enhancedPrompt += `\n\nPlease respond in ${languageNames[language] || language}.`;
        }

        // Query AI with enhanced context
        const result = await ragService.queryKnowledgeBase(enhancedPrompt, {
            topK: 5
        });

        res.json({
            success: true,
            data: {
                question,
                answer: result.response,
                context: context?.domain || 'general',
                language,
                sources: result.sources,
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Contextual query error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/ai-forecast/auto-insights
 * Automatically generate insights based on user's domain data
 */
router.post('/auto-insights', async (req, res) => {
    try {
        const { context } = req.body;

        if (!context || !context.domain) {
            return res.status(400).json({
                success: false,
                error: 'Context with domain is required'
            });
        }

        logger.info('Generating auto-insights:', { domain: context.domain });

        let insightPrompt = '';

        // Generate domain-specific insights
        if (context.domain === 'farmers') {
            insightPrompt = `
Analyze this farmer's data and provide 3-5 key actionable insights:

Crop: ${context.cropType || 'Not specified'}
Location: ${context.location || 'Not specified'}
Harvest Date: ${context.harvestDate || 'Not specified'}
Soil Type: ${context.soilType || 'Not specified'}
Irrigation: ${context.irrigation || 'Not specified'}

Provide insights on:
1. Optimal harvest timing
2. Weather considerations
3. Market timing
4. Quality optimization
5. Risk mitigation`;
        }
        else if (context.domain === 'storage') {
            insightPrompt = `
Analyze this storage facility and provide 3-5 key optimization insights:

Storage Type: ${context.storageType || 'Not specified'}
Capacity: ${context.capacity || 'Not specified'}
Current Stock: ${context.currentStock || 'Not specified'}
Commodity: ${context.commodity || 'Not specified'}

Provide insights on:
1. Capacity optimization
2. Spoilage prevention
3. Temperature/humidity control
4. Inventory management
5. Cost reduction`;
        }
        else if (context.domain === 'logistics') {
            insightPrompt = `
Analyze this logistics operation and provide 3-5 key optimization insights:

Transport Type: ${context.transportType || 'Not specified'}
Route: ${context.route || 'Not specified'}
Volume: ${context.volume || 'Not specified'}
Commodity: ${context.commodity || 'Not specified'}

Provide insights on:
1. Route optimization
2. Cost reduction
3. Time efficiency
4. Load optimization
5. Risk management`;
        }

        const result = await ragService.queryKnowledgeBase(insightPrompt, {
            topK: 5
        });

        res.json({
            success: true,
            data: {
                domain: context.domain,
                insights: result.response,
                sources: result.sources,
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Auto-insights error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

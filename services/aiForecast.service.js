/**
 * AI-Enhanced Forecast Service
 * Integrates LLM and RAG for intelligent forecast analysis
 */

const llmConfig = require('../config/llm.config');
const ragService = require('./rag.service');
const logger = require('./logger');

class AIForecastService {
    /**
     * Enhance forecast with AI-generated insights
     */
    async enhanceForecast(forecastData) {
        try {
            const insights = await Promise.all([
                this.generateHarvestInsights(forecastData),
                this.generateRiskAnalysis(forecastData),
                this.generateOptimizationSuggestions(forecastData)
            ]);

            return {
                ...forecastData,
                ai_insights: {
                    harvest_insights: insights[0],
                    risk_analysis: insights[1],
                    optimization_suggestions: insights[2],
                    generated_at: new Date().toISOString()
                }
            };

        } catch (error) {
            logger.error('AI forecast enhancement error:', error);
            // Return original forecast if AI enhancement fails
            return forecastData;
        }
    }

    /**
     * Generate harvest insights using LLM
     */
    async generateHarvestInsights(forecastData) {
        const prompt = `
Analyze this harvest forecast data and provide key insights:

Forecast Data:
- Total Forecasted Volume: ${forecastData.total_forecasted_volume} MT
- Harvest Window: ${forecastData.harvest_window_days} days
- Expected Start Date: ${forecastData.expected_harvest_date}
- Weather Condition: ${forecastData.weather?.condition || 'Normal'}
- Number of Farmers: ${forecastData.total_farmers || 'Multiple'}

Provide:
1. Key opportunities
2. Potential challenges
3. Critical timing considerations
4. Resource requirements

Keep the response concise and actionable.`;

        const response = await llmConfig.generateCompletion(prompt, {
            systemPrompt: 'You are an agricultural forecast analyst. Provide clear, data-driven insights.',
            temperature: 0.6,
            maxTokens: 500
        });

        return this.parseInsights(response);
    }

    /**
     * Generate risk analysis
     */
    async generateRiskAnalysis(forecastData) {
        const riskFactors = this.identifyRiskFactors(forecastData);

        const prompt = `
Analyze these agricultural risks:

${riskFactors.map((risk, idx) => `${idx + 1}. ${risk.type}: ${risk.description} (Severity: ${risk.severity})`).join('\n')}

Forecast Context:
- Volume: ${forecastData.total_forecasted_volume} MT
- Logistics Stress: ${forecastData.logistics_stress_level}
- Storage Utilization: ${forecastData.storage_utilization_percentage}%

For each risk:
1. Assess likelihood (low/medium/high)
2. Suggest specific mitigation strategies
3. Prioritize actions

Be concise and actionable.`;

        const response = await llmConfig.generateCompletion(prompt, {
            systemPrompt: 'You are an agricultural risk analyst. Focus on practical mitigation strategies.',
            temperature: 0.5,
            maxTokens: 600
        });

        return {
            identified_risks: riskFactors,
            analysis: response,
            risk_score: this.calculateRiskScore(riskFactors)
        };
    }

    /**
     * Generate optimization suggestions using RAG
     */
    async generateOptimizationSuggestions(forecastData) {
        try {
            const query = `
How can we optimize agricultural operations with:
- Forecasted volume: ${forecastData.total_forecasted_volume} MT
- Logistics stress: ${forecastData.logistics_stress_level}
- Storage capacity: ${forecastData.total_storage_capacity} MT
- Current storage usage: ${forecastData.current_storage_usage} MT`;

            const ragResponse = await ragService.generateResponse(query, forecastData, {
                systemPrompt: 'You are an agricultural operations optimizer. Suggest specific, implementable improvements.',
                topK: 3,
                temperature: 0.6,
                maxTokens: 500
            });

            return {
                suggestions: ragResponse.response,
                sources: ragResponse.sources
            };

        } catch (error) {
            logger.error('Optimization generation error:', error);
            return {
                suggestions: 'Unable to generate AI-powered suggestions at this time.',
                sources: []
            };
        }
    }

    /**
     * Generate intelligent advisories
     */
    async generateIntelligentAdvisories(forecastData) {
        const advisoryTypes = this.determineRequiredAdvisories(forecastData);

        const advisories = await Promise.all(
            advisoryTypes.map(async (type) => {
                try {
                    const advisory = await ragService.generateAdvisory(forecastData, type);
                    return {
                        type,
                        priority: this.calculateAdvisoryPriority(type, forecastData),
                        content: advisory.response,
                        sources: advisory.sources
                    };
                } catch (error) {
                    logger.error(`Advisory generation error for ${type}:`, error);
                    return null;
                }
            })
        );

        return advisories.filter(a => a !== null);
    }

    /**
     * Natural language query interface for forecasts
     */
    async queryForecast(question, forecastData) {
        const context = {
            forecast_summary: forecastData,
            query: question
        };

        const prompt = `
Based on this forecast data:
${JSON.stringify(forecastData, null, 2)}

Answer this question: ${question}

Provide a clear, specific answer based on the data. If the data doesn't contain the information needed, say so.`;

        const response = await llmConfig.generateCompletion(prompt, {
            systemPrompt: 'You are a helpful agricultural forecast assistant. Answer questions clearly and accurately.',
            temperature: 0.5,
            maxTokens: 400
        });

        return {
            question,
            answer: response,
            context: forecastData
        };
    }

    // Helper methods

    identifyRiskFactors(forecastData) {
        const risks = [];

        // Logistics risks
        if (forecastData.logistics_stress_level === 'HIGH') {
            risks.push({
                type: 'logistics',
                description: 'High transportation stress may cause delays',
                severity: 'high'
            });
        }

        // Storage risks
        if (forecastData.storage_utilization_percentage > 90) {
            risks.push({
                type: 'storage',
                description: 'Storage capacity near limit',
                severity: 'high'
            });
        }

        // Weather risks
        if (forecastData.weather?.condition === 'Adverse') {
            risks.push({
                type: 'weather',
                description: 'Adverse weather conditions expected',
                severity: 'medium'
            });
        }

        // Volume risks
        if (forecastData.excess_volume > 0) {
            risks.push({
                type: 'overflow',
                description: `Excess volume of ${forecastData.excess_volume} MT beyond capacity`,
                severity: 'high'
            });
        }

        return risks;
    }

    calculateRiskScore(risks) {
        const severityScores = { low: 1, medium: 3, high: 5 };
        const total = risks.reduce((sum, risk) => sum + severityScores[risk.severity], 0);
        const maxScore = risks.length * 5;
        return maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;
    }

    determineRequiredAdvisories(forecastData) {
        const advisories = ['harvest'];

        if (forecastData.logistics_stress_level === 'HIGH' || forecastData.logistics_stress_level === 'MEDIUM') {
            advisories.push('logistics');
        }

        if (forecastData.storage_utilization_percentage > 70) {
            advisories.push('storage');
        }

        if (forecastData.weather?.condition === 'Adverse') {
            advisories.push('weather');
        }

        return advisories;
    }

    calculateAdvisoryPriority(type, forecastData) {
        const priorityMap = {
            harvest: 1,
            logistics: forecastData.logistics_stress_level === 'HIGH' ? 1 : 2,
            storage: forecastData.storage_utilization_percentage > 90 ? 1 : 2,
            weather: forecastData.weather?.condition === 'Adverse' ? 1 : 3
        };

        return priorityMap[type] || 3;
    }

    parseInsights(text) {
        // Simple parsing - in production, use structured output
        return text.trim();
    }
}

module.exports = new AIForecastService();

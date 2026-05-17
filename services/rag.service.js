/**
 * RAG (Retrieval-Augmented Generation) Service
 * Combines vector search with LLM generation for context-aware responses
 */

const llmConfig = require('../config/llm.config');
const vectorDB = require('../config/vectordb.config');
const logger = require('./logger');

class RAGService {
    /**
     * Generate response using RAG
     * @param {string} query - User query
     * @param {object} context - Additional context to include
     * @param {object} options - Generation options
     */
    async generateResponse(query, context = {}, options = {}) {
        try {
            // Check if vector DB is available
            if (!vectorDB.isInitialized || vectorDB.provider === 'none') {
                // Skip RAG, use direct LLM without embeddings
                logger.info('Vector DB not available, using direct LLM response');
                const prompt = this.buildPromptWithoutRAG(query, context, options);
                const response = await llmConfig.generateCompletion(prompt, {
                    systemPrompt: options.systemPrompt,
                    temperature: options.temperature || 0.7,
                    maxTokens: options.maxTokens || 1500
                });

                return {
                    response,
                    sources: [],
                    context: { additional_data: context },
                    rag_used: false
                };
            }

            // Full RAG path (when vector DB is available)
            // Step 1: Generate embedding for the query
            const queryEmbedding = await llmConfig.generateEmbedding(query);

            // Step 2: Retrieve relevant context from vector DB
            const relevantDocs = await vectorDB.query(queryEmbedding, {
                topK: options.topK || 5,
                filter: options.filter || {}
            });

            // Step 3: Build context from retrieved documents
            const retrievedContext = this.buildContext(relevantDocs, context);

            // Step 4: Generate response with LLM
            const prompt = this.buildPrompt(query, retrievedContext, options);
            const response = await llmConfig.generateCompletion(prompt, {
                systemPrompt: options.systemPrompt,
                temperature: options.temperature || 0.7,
                maxTokens: options.maxTokens || 1500
            });

            return {
                response,
                sources: relevantDocs.map(doc => ({
                    title: doc.metadata.title,
                    score: doc.score,
                    category: doc.metadata.category
                })),
                context: retrievedContext,
                rag_used: true
            };

        } catch (error) {
            logger.error('RAG generation error:', error);
            throw error;
        }
    }

    /**
     * Build context from retrieved documents and additional context
     */
    buildContext(documents, additionalContext) {
        const context = {
            retrieved_knowledge: documents.map(doc => ({
                content: doc.metadata.text,
                source: doc.metadata.title,
                relevance: doc.score,
                category: doc.metadata.category
            })),
            additional_data: additionalContext
        };

        return context;
    }

    /**
     * Build prompt with context
     */
    buildPrompt(query, context, options = {}) {
        const contextStr = context.retrieved_knowledge
            .map((doc, idx) => `[Source ${idx + 1}: ${doc.source}]\n${doc.content}`)
            .join('\n\n');

        const additionalDataStr = Object.keys(context.additional_data).length > 0
            ? `\nCurrent Data:\n${JSON.stringify(context.additional_data, null, 2)}`
            : '';

        return `
You are an expert agricultural AI assistant helping farmers and agricultural coordinators make better decisions.

RELEVANT KNOWLEDGE BASE:
${contextStr}
${additionalDataStr}

USER QUERY:
${query}

INSTRUCTIONS:
- Use the provided knowledge base to inform your response
- Be specific and actionable
- If the knowledge base doesn't contain relevant information, use your general agricultural expertise
- Cite sources when using specific information from the knowledge base
- Provide practical recommendations

RESPONSE:`;
    }

    /**
     * Build prompt without RAG (when vector DB is not available)
     */
    buildPromptWithoutRAG(query, context, options = {}) {
        const additionalDataStr = Object.keys(context).length > 0
            ? `\nContext Data:\n${JSON.stringify(context, null, 2)}`
            : '';

        return `
You are an expert agricultural AI assistant helping farmers and agricultural coordinators make better decisions.
${additionalDataStr}

USER QUERY:
${query}

INSTRUCTIONS:
- Provide specific and actionable advice
- Use your agricultural expertise
- Consider Indian agricultural practices when relevant
- Provide practical recommendations

RESPONSE:`;
    }

    /**
     * Generate agricultural advisory with RAG
     */
    async generateAdvisory(forecastData, advisoryType) {
        const query = this.buildAdvisoryQuery(forecastData, advisoryType);

        const systemPrompt = `You are an expert agricultural advisor specializing in ${advisoryType}. 
Provide clear, actionable recommendations based on forecast data and agricultural best practices.`;

        return await this.generateResponse(query, forecastData, {
            systemPrompt,
            filter: { category: advisoryType },
            topK: 3
        });
    }

    buildAdvisoryQuery(forecastData, advisoryType) {
        const queries = {
            harvest: `Based on forecasted harvest volume of ${forecastData.total_forecasted_volume} MT and harvest window of ${forecastData.harvest_window_days} days, what are the best practices for harvest coordination and timing?`,
            logistics: `With logistics stress level at ${forecastData.logistics_stress_level} and transport capacity of ${forecastData.transport_capacity} MT/day, how should we optimize transportation and distribution?`,
            storage: `Given storage capacity of ${forecastData.total_storage_capacity} MT with current usage at ${forecastData.current_storage_usage} MT, and incoming volume of ${forecastData.forecasted_volume} MT, what storage strategies should we implement?`,
            weather: `With weather condition showing ${forecastData.weather_condition}, what mitigation strategies should farmers implement?`
        };

        return queries[advisoryType] || `Provide advisory for ${advisoryType} based on current agricultural data.`;
    }

    /**
     * Natural language query interface
     */
    async queryKnowledgeBase(question, options = {}) {
        return await this.generateResponse(question, {}, {
            systemPrompt: 'You are a helpful agricultural knowledge assistant. Answer questions based on the agricultural knowledge base.',
            ...options
        });
    }

    /**
     * Index new knowledge into vector DB
     */
    async indexKnowledge(documents) {
        try {
            const vectors = await Promise.all(
                documents.map(async (doc) => {
                    const embedding = await llmConfig.generateEmbedding(doc.text);
                    return {
                        id: doc.id,
                        embedding,
                        metadata: {
                            title: doc.title,
                            text: doc.text,
                            category: doc.category,
                            tags: doc.tags,
                            created_at: new Date().toISOString()
                        }
                    };
                })
            );

            const result = await vectorDB.upsert(vectors);
            logger.info(`Indexed ${result.count} documents into vector database`);
            return result;

        } catch (error) {
            logger.error('Knowledge indexing error:', error);
            throw error;
        }
    }

    /**
     * Generate embeddings for batch processing
     */
    async generateBatchEmbeddings(texts) {
        return await Promise.all(
            texts.map(text => llmConfig.generateEmbedding(text))
        );
    }
}

module.exports = new RAGService();

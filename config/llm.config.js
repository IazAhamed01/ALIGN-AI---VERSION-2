/**
 * LLM Configuration Module
 * Supports multiple LLM providers: OpenAI, Google Gemini
 */

require('dotenv').config();
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../services/logger');
const Groq = require('groq-sdk');

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'groq'; // 'openai', 'gemini', or 'groq'

class LLMConfig {
    constructor() {
        this.provider = LLM_PROVIDER;
        this.initializeClients();
    }

    initializeClients() {
        // Initialize OpenAI
        if (this.provider === 'openai' && process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
            this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
        }

        // Initialize Google Gemini
        if (this.provider === 'gemini' && process.env.GEMINI_API_KEY) {
            this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        }

        // Initialize Groq (Llama)
        if (this.provider === 'groq' && process.env.GROQ_API_KEY) {
            this.groq = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });
            this.model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
        }
    }

    /**
     * Generate text completion
     */
    async generateCompletion(prompt, options = {}) {
        try {
            if (this.provider === 'openai') {
                return await this.generateOpenAICompletion(prompt, options);
            } else if (this.provider === 'gemini') {
                return await this.generateGeminiCompletion(prompt, options);
            } else if (this.provider === 'groq') {
                return await this.generateGroqCompletion(prompt, options);
            }
        } catch (error) {
            console.error('LLM completion error:', error);
            throw error;
        }
    }

    /**
     * OpenAI completion
     */
    async generateOpenAICompletion(prompt, options = {}) {
        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: options.systemPrompt || 'You are an expert agricultural AI assistant.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1000,
            response_format: options.jsonMode ? { type: 'json_object' } : undefined
        });

        return response.choices[0].message.content;
    }

    /**
     * Google Gemini completion
     */
    async generateGeminiCompletion(prompt, options = {}) {
        const modelsToTry = [
            this.model,
            'gemini-2.5-flash',
            'gemini-1.5-flash',
            'gemini-flash-latest',
            'gemini-pro'
        ].filter(Boolean);

        const systemPrompt = options.systemPrompt || 'You are an expert agricultural AI assistant.';
        const fullPrompt = `${systemPrompt}\n\n${prompt}`;
        const generationConfig = {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 1000,
            responseMimeType: options.jsonMode ? 'application/json' : undefined
        };

        let lastError;
        for (const modelName of modelsToTry) {
            try {
                logger.info(`Attempting Gemini completion with model: ${modelName}`);
                const model = this.gemini.getGenerativeModel({ model: modelName });

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                    generationConfig
                });

                if (result && result.response) {
                    const text = result.response.text();
                    logger.info(`Successfully generated content with model: ${modelName}`);
                    return text;
                }
            } catch (err) {
                logger.warn(`Gemini model ${modelName} failed: ${err.message}`);
                lastError = err;

                // If it's a quota error (429), we could try another model,
                // but usually the quota is shared. Still, no harm in trying.
                continue;
            }
        }

        // DEMO MODE FALLBACK
        // If all models fail due to invalid/missing API key, return a contextually relevant mock response.
        logger.error(`All Gemini models failed. Using DEMO FALLBACK response.`);

        const q = prompt.toLowerCase();

        // Greeting / general
        if (q.includes('hello') || q.includes('hi ') || q.match(/^.*\bhi\b.*$/) || q.includes('hey')) {
            return `Hello! 👋 I'm your AlignAI agricultural assistant. I can help you with:

- 🌾 **Farmers** – crop readiness, harvest timing, best practices
- 🏭 **Storage** – cold storage optimization, inventory management
- 🚛 **Logistics** – route planning, cost reduction, fleet management
- 🛒 **Market** – price trends, demand forecasting

What would you like to know today?`;
        }

        // Transportation / logistics cost
        if (q.includes('transport') || q.includes('truck') || q.includes('logistics') || q.includes('cost') || q.includes('route') || q.includes('fleet')) {
            return `**Logistics Optimization Report:**

1. **Route Efficiency** – The Kalaburagi-Bangalore route is showing a 15% delay due to roadworks near Chitradurga. Consider alternate NH-50 route.
2. **Fleet Status** – Consolidate smaller loads from nearby farms to maximize truck fill ratio and reduce per-unit cost.
3. **Cost Saving** – Combining loads with nearby farms can reduce transport costs by 10–15%.
4. **Timing** – Schedule transport in early morning (5–8 AM) to avoid traffic and reduce fuel spend.
5. **Tracking** – Use ULIP-integrated tracking for real-time visibility and delay alerts.`;
        }

        // Storage / warehouse / cold storage / capacity
        if (q.includes('storage') || q.includes('warehouse') || q.includes('cold') || q.includes('capacity') || q.includes('inventory')) {
            return `**Storage Facility Analysis:**

1. **Utilization** – Cold storage is at 33% capacity. Ample space available for the upcoming harvest season.
2. **Priority** – Load "N-53" variety onions first — shorter shelf life requires faster dispatch.
3. **Energy Efficiency** – Cooling load spikes between 2–5 PM. Shift pre-cooling cycles to 10 PM–4 AM for 20% energy savings.
4. **Spoilage Prevention** – Maintain temperature at 0–2°C and humidity at 65–70% for optimal preservation.
5. **Allocation** – Reserve 30% capacity buffer for emergency overflow from neighboring districts.`;
        }

        // Market / price / demand / mandi
        if (q.includes('market') || q.includes('price') || q.includes('mandi') || q.includes('demand') || q.includes('sell') || q.includes('ondc')) {
            return `**Market Intelligence Update:**

1. **Prices** – Onion prices at ₹25/kg at Kalaburagi mandi, up 8% from last week. Peak expected in May.
2. **Demand** – High buyer activity from Pune and Hyderabad wholesale markets this week.
3. **Strategy** – Hold 40% stock in cold storage and release in May for better returns.
4. **ONDC Tip** – List produce on ONDC at least 5 days before harvest to pre-book buyers and reduce post-harvest losses.
5. **Trend** – Avoid selling in bulk on Mondays — prices historically dip 5–7% at week start.`;
        }

        // Farmer / harvest / crop / weather / yield
        if (q.includes('farmer') || q.includes('harvest') || q.includes('crop') || q.includes('weather') || q.includes('yield') || q.includes('soil') || q.includes('irrigation')) {
            return `**Farmer Advisory – Karnataka Region:**

1. **Harvest Timing** – With prices at ₹25/kg and rising, delaying harvest by 5–7 days can improve bulb maturity and returns.
2. **Weather Alert** – Light rain forecast next week. Ensure field drainage to prevent bulb rot.
3. **Storage** – Store 40% of yield in cold storage to benefit from peak May demand.
4. **Soil Health** – Post-harvest, apply green manure (Dhaincha) to restore nitrogen levels before the next sowing.
5. **Pest Watch** – Monitor for thrips and downy mildew during the humid pre-harvest period.`;
        }

        // Dashboard / forecast / coordination
        if (q.includes('dashboard') || q.includes('forecast') || q.includes('coordination') || q.includes('analysis') || q.includes('stress')) {
            return `**Coordination Dashboard Summary:**

1. **Harvest Volume** – 174 MT forecasted across 3 farmers in the Kalaburagi region.
2. **Logistics Stress** – MEDIUM. Transport capacity at 78% utilization. Pre-book additional vehicles.
3. **Storage Status** – 33% utilized. 537 MT available across 3 cold storage facilities.
4. **Advisories** – Begin staggered harvesting to avoid logistics bottlenecks on peak days.
5. **Next Steps** – Run Dashboard coordination to get real-time optimized allocation plans.`;
        }

        // Default fallback for anything else
        return `Thanks for your question! Here are some general agricultural best practices:

1. **Soil Monitoring** – Check moisture levels daily during the growing and pre-harvest phase.
2. **Pest Control** – Inspect crops early morning when pest activity is most visible.
3. **Market Timing** – Check local mandi prices before scheduling transport to maximize returns.
4. **Storage** – Ensure post-harvest cooling within 4 hours to reduce spoilage by up to 30%.
5. **Planning** – Use ALIGN's Dashboard to coordinate harvest, storage, and logistics in one place.`;
    }

    /**
     * Groq (Llama) completion
     */
    async generateGroqCompletion(prompt, options = {}) {
        try {
            const systemPrompt = options.systemPrompt || 'You are an expert assistant specializing in Agriculture, Storage, and Logistics. Provide helpful, accurate information about farming practices, crop management, storage optimization, inventory management, logistics planning, and supply chain efficiency. Do not mention what AI model or technology you are powered by. Focus on answering the user\'s questions directly and professionally.';

            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                model: this.model,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 1000,
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            logger.error(`Groq completion error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate embeddings for RAG
     */
    async generateEmbedding(text) {
        try {
            if (this.provider === 'openai') {
                const response = await this.openai.embeddings.create({
                    model: this.embeddingModel,
                    input: text
                });
                return response.data[0].embedding;
            } else if (this.provider === 'gemini') {
                // Use correct embedding model for Gemini
                const model = this.gemini.getGenerativeModel({ model: 'text-embedding-004' });
                const result = await model.embedContent(text);
                return result.embedding.values;
            }
        } catch (error) {
            console.error('Embedding generation error:', error.message);
            throw error;
        }
    }

    /**
     * Generate structured JSON output
     */
    async generateStructuredOutput(prompt, schema, options = {}) {
        const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;

        const response = await this.generateCompletion(jsonPrompt, {
            ...options,
            jsonMode: true
        });

        try {
            return JSON.parse(response);
        } catch (error) {
            console.error('Failed to parse JSON response:', response);
            throw new Error('Invalid JSON response from LLM');
        }
    }
}

module.exports = new LLMConfig();

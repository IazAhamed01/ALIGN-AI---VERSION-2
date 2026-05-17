/**
 * Seed Vector Database with Agricultural Knowledge
 * Run this to populate the knowledge base for RAG
 */

require('dotenv').config();
const ragService = require('../services/rag.service');

const agriculturalKnowledge = [
    {
        id: 'harvest-timing-1',
        title: 'Optimal Harvest Timing for Rice',
        category: 'harvest',
        tags: ['rice', 'timing', 'best-practices'],
        text: `Optimal harvest timing for rice is critical for maximizing yield and quality. 
        Rice should be harvested when moisture content is between 20-25%. Harvesting too early 
        results in immature grains and lower yield, while late harvesting causes shattering losses 
        and grain quality degradation. The ideal time is when 80-85% of grains have turned golden 
        yellow. Use the hand-feel method: squeeze a handful of grains - if they're hard and don't 
        leave moisture on your palm, they're ready. Plan harvest during dry weather to minimize 
        moisture-related issues.`
    },
    {
        id: 'logistics-coordination-1',
        title: 'Logistics Coordination Best Practices',
        category: 'logistics',
        tags: ['transportation', 'coordination', 'efficiency'],
        text: `Effective logistics coordination requires advance planning and communication. 
        Key strategies include: 1) Schedule transportation 3-5 days in advance, 2) Create 
        collection points for farmers within 5km radius, 3) Use GPS tracking for real-time 
        monitoring, 4) Implement staggered pickup times to avoid congestion, 5) Maintain 
        backup vehicles (10-15% extra capacity), 6) Coordinate with storage facilities for 
        receiving schedules. During high stress periods, consider night operations and 
        temporary staging areas.`
    },
    {
        id: 'storage-management-1',
        title: 'Post-Harvest Storage Management',
        category: 'storage',
        tags: ['storage', 'quality', 'preservation'],
        text: `Proper storage management is essential for preserving crop quality and preventing 
        losses. Best practices include: Maintain storage temperature between 15-18°C with 
        relative humidity at 60-65%. Regular monitoring prevents pest infestation and fungal 
        growth. Use FIFO (First In First Out) system for inventory management. Ensure proper 
        ventilation and stack bags with adequate spacing. Maximum stack height should not 
        exceed 15 feet. Conduct weekly quality checks and maintain detailed logs. Reserve 
        15-20% capacity for emergency buffer during peak harvest.`
    },
    {
        id: 'weather-mitigation-1',
        title: 'Weather Risk Mitigation Strategies',
        category: 'weather',
        tags: ['weather', 'risk', 'mitigation'],
        text: `Weather-related risks can significantly impact harvest operations. Mitigation 
        strategies include: Monitor weather forecasts daily during harvest season. Have 
        contingency plans for rain delays - this includes covered staging areas and rapid 
        harvest protocols. For adverse weather predictions, accelerate harvest by deploying 
        additional resources. Use moisture meters to check grain quality post-rain. Implement 
        immediate drying procedures if moisture exceeds safe levels. Coordinate with farmers 
        to prioritize fields at higher risk. Consider crop insurance for catastrophic events.`
    },
    {
        id: 'capacity-planning-1',
        title: 'Transport Capacity Planning',
        category: 'logistics',
        tags: ['capacity', 'planning', 'optimization'],
        text: `Transport capacity planning requires balancing supply with demand efficiently. 
        Calculate daily capacity requirements based on forecasted volumes and harvest windows. 
        Use the formula: Required capacity = (Total volume / Harvest days) × 1.2 (buffer). 
        When capacity is exceeded, implement multi-shift operations, extend harvest window if 
        weather permits, or activate emergency staging locations. Prioritize high-value crops 
        and time-sensitive deliveries. Maintain relationships with backup transport providers 
        for surge capacity. Dynamic routing optimization can improve efficiency by 15-20%.`
    },
    {
        id: 'quality-control-1',
        title: 'Harvest Quality Control Standards',
        category: 'harvest',
        tags: ['quality', 'standards', 'grading'],
        text: `Quality control ensures premium prices and reduces storage losses. Implement 
        these standards: Moisture content testing for every batch - ideal is 13-14% for 
        long-term storage. Foreign matter should not exceed 2%. Broken grains should be less 
        than 5%. Use standardized grading systems and train inspectors consistently. Document 
        quality metrics for each farmer batch. Reject loads exceeding tolerance levels and 
        provide immediate feedback. Quality-based pricing incentivizes farmers to maintain 
        standards. Regular calibration of testing equipment is essential.`
    },
    {
        id: 'coordination-tech-1',
        title: 'Technology in Agricultural Coordination',
        category: 'logistics',
        tags: ['technology', 'digital', 'automation'],
        text: `Modern technology transforms agricultural coordination. Key technologies include: 
        Mobile apps for farmer communication and scheduling. GPS tracking for vehicle fleet 
        management. IoT sensors for real-time storage monitoring. Automated systems for quality 
        testing. Data analytics for demand forecasting. Blockchain for traceability. Cloud 
        platforms for centralized coordination. SMS alerts for weather updates and schedule 
        changes. Digital payment systems for faster settlements. These tools improve efficiency, 
        reduce losses, and enhance transparency across the supply chain.`
    },
    {
        id: 'farmer-coordination-1',
        title: 'Farmer Coordination and Communication',
        category: 'harvest',
        tags: ['farmers', 'communication', 'coordination'],
        text: `Effective farmer coordination is the foundation of successful harvest operations. 
        Establish regular communication channels - weekly meetings during growing season, daily 
        during harvest. Provide advance notice of 5-7 days for harvest schedules. Create farmer 
        groups based on geography for efficient collection. Share weather forecasts and market 
        updates. Implement fair rotation systems for transportation priority. Provide training 
        on quality standards and post-harvest handling. Recognize and reward best performers. 
        Address grievances promptly. Use local languages and multiple communication methods to 
        ensure all farmers are informed.`
    },
    {
        id: 'storage-optimization-1',
        title: 'Storage Space Optimization',
        category: 'storage',
        tags: ['optimization', 'space', 'efficiency'],
        text: `Maximize storage efficiency through smart space utilization. Use vertical stacking 
        with proper support structures. Implement zone-based storage - separate by crop type, 
        quality grade, and arrival date. Calculate optimal bag dimensions for space efficiency. 
        Use pallets for better air circulation and pest control. Designate fast-access zones 
        for high-turnover inventory. Reserve premium temperature-controlled areas for sensitive 
        crops. Digital mapping helps track exact locations. Regular reorganization prevents 
        wasted space. Consider modular shelving systems for flexibility. Aim for 85-90% 
        utilization maximum to maintain operational efficiency.`
    },
    {
        id: 'risk-assessment-1',
        title: 'Agricultural Risk Assessment Framework',
        category: 'weather',
        tags: ['risk', 'assessment', 'planning'],
        text: `Comprehensive risk assessment identifies and mitigates potential issues. Key risk 
        categories: Weather risks (drought, floods, storms), Market risks (price volatility), 
        Operational risks (equipment failure, labor shortage), Quality risks (contamination, 
        spoilage), Logistics risks (transport delays, capacity constraints). For each risk: 
        assess likelihood (low/medium/high) and impact (minor/moderate/severe). Develop 
        mitigation plans and contingency strategies. Review and update risk assessments monthly. 
        Maintain emergency funds at 10-15% of operational budget. Invest in insurance for 
        catastrophic events. Document lessons learned from past incidents.`
    }
];

async function seedKnowledge() {
    console.log('🌱 Starting knowledge base seeding...\n');

    try {
        console.log(`📚 Indexing ${agriculturalKnowledge.length} documents...`);

        const result = await ragService.indexKnowledge(agriculturalKnowledge);

        console.log(`✅ Successfully indexed ${result.count} documents`);
        console.log('\n📊 Knowledge Base Summary:');
        console.log(`   - Total Documents: ${agriculturalKnowledge.length}`);
        console.log(`   - Categories: harvest, logistics, storage, weather`);
        console.log(`   - Status: Ready for RAG queries\n`);

        // Test query
        console.log('🔍 Testing knowledge base with sample query...');
        const testResult = await ragService.queryKnowledgeBase(
            'What are the best practices for harvest timing?'
        );

        console.log('\n✅ Knowledge base is working correctly!');
        console.log(`   Query: "What are the best practices for harvest timing?"`);
        console.log(`   Found ${testResult.sources.length} relevant sources\n`);

        console.log('🎉 Knowledge base seeding completed successfully!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding knowledge base:', error);
        process.exit(1);
    }
}

// Run seeding
seedKnowledge();

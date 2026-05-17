/**
 * Logistics Stress Detector
 * 
 * Purpose: Identify upcoming transport bottlenecks before they occur.
 * 
 * Logic:
 * - Compare predicted harvest inflow vs assumed transport capacity
 * - Detect surge risk (NORMAL / HIGH)
 * - Generate fleet pre-positioning advisories
 */

/**
 * Detect logistics stress level
 * @param {number} forecastedVolume - Forecasted harvest volume in tonnes
 * @param {number} transportCapacity - Transport capacity per day in tonnes
 * @returns {Object} Logistics stress assessment
 */
function detectLogisticsStress(forecastedVolume, transportCapacity) {
    const utilizationRatio = forecastedVolume / transportCapacity;

    let stressLevel;
    let alert;

    if (forecastedVolume > transportCapacity) {
        stressLevel = 'HIGH';
        alert = true;
    } else if (forecastedVolume > 0.8 * transportCapacity) {
        stressLevel = 'ELEVATED';
        alert = true;
    } else {
        stressLevel = 'NORMAL';
        alert = false;
    }

    return {
        logistics_alert: alert,
        logistics_stress_level: stressLevel,
        utilization_ratio: Math.round(utilizationRatio * 100) / 100,
        forecasted_volume: forecastedVolume,
        transport_capacity: transportCapacity,
        excess_volume: Math.max(0, Math.round((forecastedVolume - transportCapacity) * 100) / 100)
    };
}

/**
 * Generate logistics advisories based on stress level
 * @param {Object} stressData - Output from detectLogisticsStress
 * @returns {Array} List of advisory strings
 */
function generateLogisticsAdvisories(stressData) {
    const advisories = [];

    if (stressData.logistics_stress_level === 'HIGH') {
        advisories.push('⚠️ CRITICAL: Pre-position additional transport fleet immediately');
        advisories.push('📅 Consider staggering harvest timing across 2-3 days');
        advisories.push('🚛 Request backup transport from neighboring districts');
        advisories.push(`📊 Excess volume: ${stressData.excess_volume} tonnes needs additional capacity`);
    } else if (stressData.logistics_stress_level === 'ELEVATED') {
        advisories.push('⚡ ALERT: Transport utilization approaching capacity');
        advisories.push('🚛 Put backup transport on standby');
        advisories.push('📋 Prioritize perishable loads for first transport wave');
    } else {
        advisories.push('✅ Transport capacity is sufficient for forecasted volume');
        advisories.push('📋 Standard fleet deployment recommended');
    }

    return advisories;
}

/**
 * Calculate optimal staging locations
 * @param {string} regionId - Region identifier
 * @param {number} excessVolume - Volume exceeding transport capacity
 * @returns {Array} Suggested staging locations
 */
function suggestStagingLocations(regionId, excessVolume) {
    // In MVP, return static recommendations
    // In production, this would use geospatial data

    if (excessVolume <= 0) {
        return [];
    }

    return [
        {
            location: 'Primary Collection Point - Village Hub',
            priority: 1,
            suggested_capacity: Math.min(excessVolume * 0.6, 50)
        },
        {
            location: 'Secondary Collection Point - Mandi Approach',
            priority: 2,
            suggested_capacity: Math.min(excessVolume * 0.4, 30)
        }
    ];
}

/**
 * Main logistics assessment function
 * @param {Object} params - Input parameters
 * @param {number} params.forecastedVolume - Forecasted harvest volume
 * @param {number} params.transportCapacity - Daily transport capacity
 * @param {string} params.regionId - Region identifier
 * @returns {Object} Complete logistics assessment
 */
function assessLogistics(params) {
    const { forecastedVolume, transportCapacity, regionId } = params;

    const stressData = detectLogisticsStress(forecastedVolume, transportCapacity);
    const advisories = generateLogisticsAdvisories(stressData);
    const stagingLocations = suggestStagingLocations(regionId, stressData.excess_volume);

    return {
        ...stressData,
        advisories,
        staging_locations: stagingLocations,
        fleet_preposition_required: stressData.logistics_alert
    };
}

module.exports = {
    detectLogisticsStress,
    generateLogisticsAdvisories,
    suggestStagingLocations,
    assessLogistics
};

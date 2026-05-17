/**
 * Storage Allocation Forecaster
 * 
 * Purpose: Prevent cold storage mismatch and late allocation.
 * 
 * Logic:
 * - Predict storage demand based on excess harvest volume
 * - Compare with available capacity bands
 * - Generate storage reservation recommendations
 */

/**
 * Calculate available storage capacity
 * @param {number} totalCapacity - Total storage capacity in tonnes
 * @param {number} currentUsage - Current usage in tonnes
 * @returns {Object} Storage availability data
 */
function calculateAvailableStorage(totalCapacity, currentUsage) {
    const available = totalCapacity - currentUsage;
    const utilizationPercent = (currentUsage / totalCapacity) * 100;

    let utilizationBand;
    if (utilizationPercent < 50) {
        utilizationBand = 'LOW';
    } else if (utilizationPercent < 80) {
        utilizationBand = 'MEDIUM';
    } else {
        utilizationBand = 'HIGH';
    }

    return {
        total_capacity: totalCapacity,
        current_usage: currentUsage,
        available_capacity: available,
        utilization_percent: Math.round(utilizationPercent * 100) / 100,
        utilization_band: utilizationBand
    };
}

/**
 * Forecast storage demand based on excess volume
 * @param {number} forecastedVolume - Total forecasted harvest volume
 * @param {number} transportCapacity - Volume that can be transported immediately
 * @returns {number} Excess volume requiring storage
 */
function forecastStorageDemand(forecastedVolume, transportCapacity) {
    // Excess volume is what cannot be transported immediately
    return Math.max(0, forecastedVolume - transportCapacity);
}

/**
 * Determine storage action and reservation percentage
 * @param {number} excessVolume - Volume requiring storage
 * @param {number} availableStorage - Available storage capacity
 * @param {number} totalCapacity - Total storage capacity
 * @returns {Object} Storage allocation decision
 */
function determineStorageAction(excessVolume, availableStorage, totalCapacity) {
    let alert = false;
    let action;
    let reservePercentage = 0;
    let urgency = 'LOW';

    if (excessVolume <= 0) {
        action = 'NO_ACTION';
        urgency = 'NONE';
    } else if (excessVolume > availableStorage) {
        alert = true;
        action = 'RESERVE_IMMEDIATELY';
        reservePercentage = 100;
        urgency = 'CRITICAL';
    } else if (excessVolume > availableStorage * 0.7) {
        alert = true;
        action = 'RESERVE_URGENT';
        reservePercentage = Math.round((excessVolume / totalCapacity) * 100);
        urgency = 'HIGH';
    } else if (excessVolume > 0) {
        alert = true;
        action = 'RESERVE_PARTIAL';
        reservePercentage = Math.round((excessVolume / totalCapacity) * 100);
        urgency = 'MEDIUM';
    }

    return {
        storage_alert: alert,
        storage_action: action,
        storage_reserve_percentage: reservePercentage,
        excess_volume: Math.round(excessVolume * 100) / 100,
        available_storage: Math.round(availableStorage * 100) / 100,
        urgency
    };
}

/**
 * Generate storage advisories
 * @param {Object} allocationData - Output from determineStorageAction
 * @returns {Array} List of advisory strings
 */
function generateStorageAdvisories(allocationData) {
    const advisories = [];

    switch (allocationData.storage_action) {
        case 'RESERVE_IMMEDIATELY':
            advisories.push('🚨 CRITICAL: Storage capacity insufficient for forecasted excess');
            advisories.push('📞 Contact additional cold storage facilities immediately');
            advisories.push('🥬 Prioritize most perishable produce for available storage');
            advisories.push('📅 Consider accelerating market dispatch to free capacity');
            break;

        case 'RESERVE_URGENT':
            advisories.push('⚠️ URGENT: Reserve storage capacity now');
            advisories.push(`📊 Reserve ${allocationData.storage_reserve_percentage}% of total capacity`);
            advisories.push('🕐 Recommended reservation window: Next 24-48 hours');
            break;

        case 'RESERVE_PARTIAL':
            advisories.push('📋 PLANNED: Partial storage reservation recommended');
            advisories.push(`📊 Reserve ${allocationData.storage_reserve_percentage}% of total capacity`);
            advisories.push('🕐 Recommended reservation window: Next 3-5 days');
            break;

        default:
            advisories.push('✅ No immediate storage reservation required');
            advisories.push('📋 Transport capacity is sufficient for forecasted volume');
    }

    return advisories;
}

/**
 * Aggregate storage from multiple facilities
 * @param {Array} facilities - Array of storage facility objects
 * @returns {Object} Aggregated storage data
 */
function aggregateStorageFacilities(facilities) {
    const totalCapacity = facilities.reduce((sum, f) => sum + f.total_capacity, 0);
    const totalUsage = facilities.reduce((sum, f) => sum + f.current_usage, 0);

    return {
        facility_count: facilities.length,
        total_capacity: totalCapacity,
        total_usage: totalUsage,
        total_available: totalCapacity - totalUsage,
        facilities: facilities.map(f => ({
            ...f,
            available: f.total_capacity - f.current_usage
        }))
    };
}

/**
 * Main storage allocation assessment function
 * @param {Object} params - Input parameters
 * @param {number} params.forecastedVolume - Forecasted harvest volume
 * @param {number} params.transportCapacity - Transport capacity per day
 * @param {number} params.totalStorageCapacity - Total storage capacity
 * @param {number} params.currentStorageUsage - Current storage usage
 * @returns {Object} Complete storage assessment
 */
function assessStorageAllocation(params) {
    const {
        forecastedVolume,
        transportCapacity,
        totalStorageCapacity,
        currentStorageUsage
    } = params;

    // Calculate current storage availability
    const availability = calculateAvailableStorage(totalStorageCapacity, currentStorageUsage);

    // Forecast storage demand
    const excessVolume = forecastStorageDemand(forecastedVolume, transportCapacity);

    // Determine storage action
    const allocation = determineStorageAction(
        excessVolume,
        availability.available_capacity,
        totalStorageCapacity
    );

    // Generate advisories
    const advisories = generateStorageAdvisories(allocation);

    return {
        current_availability: availability,
        demand_forecast: {
            forecasted_volume: forecastedVolume,
            transport_capacity: transportCapacity,
            excess_requiring_storage: excessVolume
        },
        allocation_decision: allocation,
        advisories
    };
}

module.exports = {
    calculateAvailableStorage,
    forecastStorageDemand,
    determineStorageAction,
    generateStorageAdvisories,
    aggregateStorageFacilities,
    assessStorageAllocation
};

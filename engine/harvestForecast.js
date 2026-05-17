/**
 * Harvest Inflow Forecast Engine
 * 
 * Purpose: Estimate how much produce will enter the system over the next 3–5 days.
 * 
 * Algorithm:
 * 1. Harvest Readiness Estimation - Expected harvest date calculation
 * 2. Readiness Index Computation - Weighted scoring
 * 3. Volume Forecasting - Base volume × readiness index
 * 4. Intensity Classification - LOW/MEDIUM/HIGH bands
 */

const FORECAST_WINDOW = 5; // days

/**
 * Calculate weather modifier based on deviation flag
 * @param {number} deviationFlag - -1 (adverse), 0 (normal), +1 (favorable)
 * @returns {number} Weather modifier value
 */
function getWeatherModifier(deviationFlag) {
    switch (deviationFlag) {
        case -1: return 0.9;  // Adverse weather reduces yield
        case 1: return 1.1;  // Favorable weather increases yield
        default: return 1.0;  // Normal conditions
    }
}

/**
 * Calculate the expected harvest date
 * @param {string} sowingDate - Date the crop was sown (ISO format)
 * @param {number} avgMaturityDays - Average days to maturity for the crop
 * @returns {Date} Expected harvest date
 */
function calculateExpectedHarvestDate(sowingDate, avgMaturityDays) {
    const sowing = new Date(sowingDate);
    const harvestDate = new Date(sowing);
    harvestDate.setDate(sowing.getDate() + avgMaturityDays);
    return harvestDate;
}

/**
 * Calculate days until harvest
 * @param {Date} harvestDate - Expected harvest date
 * @param {Date} today - Current date
 * @returns {number} Days until harvest (can be negative if past due)
 */
function getDaysToHarvest(harvestDate, today = new Date()) {
    const diffTime = harvestDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate maturity score based on proximity to harvest
 * @param {number} daysToHarvest - Days until expected harvest
 * @returns {number} Maturity score (0.5 or 1.0)
 */
function calculateMaturityScore(daysToHarvest) {
    // If within forecast window, full maturity score
    if (daysToHarvest <= FORECAST_WINDOW) {
        return 1.0;
    }
    return 0.5;
}

/**
 * Compute Readiness Index
 * Formula: (0.5 × Farmer_Readiness) + (0.3 × Maturity_Score) + (0.2 × Weather_Modifier)
 * 
 * @param {number} farmerReadinessScore - Farmer's reported readiness (0-1)
 * @param {number} maturityScore - Calculated maturity score
 * @param {number} weatherModifier - Weather adjustment factor
 * @returns {number} Readiness index
 */
function computeReadinessIndex(farmerReadinessScore, maturityScore, weatherModifier) {
    return (0.5 * farmerReadinessScore) +
        (0.3 * maturityScore) +
        (0.2 * weatherModifier);
}

/**
 * Calculate base harvest volume
 * @param {number} cultivatedArea - Area in hectares
 * @param {number} avgYieldPerHectare - Average yield in tonnes per hectare
 * @returns {number} Base volume in tonnes
 */
function calculateBaseVolume(cultivatedArea, avgYieldPerHectare) {
    return cultivatedArea * avgYieldPerHectare;
}

/**
 * Calculate forecasted harvest volume
 * @param {number} baseVolume - Base volume in tonnes
 * @param {number} readinessIndex - Computed readiness index
 * @returns {number} Forecasted harvest volume in tonnes
 */
function calculateForecastedVolume(baseVolume, readinessIndex) {
    return baseVolume * readinessIndex;
}

/**
 * Classify harvest intensity level
 * @param {number} forecastedVolume - Forecasted harvest volume
 * @param {number} transportCapacity - Transport capacity per day
 * @returns {string} Harvest level: LOW, MEDIUM, or HIGH
 */
function classifyHarvestLevel(forecastedVolume, transportCapacity) {
    if (forecastedVolume < 0.7 * transportCapacity) {
        return 'LOW';
    } else if (forecastedVolume <= transportCapacity) {
        return 'MEDIUM';
    }
    return 'HIGH';
}

/**
 * Main Harvest Forecast Function
 * Combines all steps to produce a complete forecast
 * 
 * @param {Object} params - Input parameters
 * @param {string} params.sowingDate - Sowing date (ISO format)
 * @param {number} params.avgMaturityDays - Crop maturity days
 * @param {number} params.cultivatedArea - Area in hectares
 * @param {number} params.avgYieldPerHectare - Yield per hectare
 * @param {number} params.farmerReadinessScore - Farmer readiness (0-1)
 * @param {number} params.weatherDeviationFlag - Weather deviation (-1, 0, 1)
 * @param {number} params.transportCapacity - Transport capacity per day
 * @returns {Object} Complete harvest forecast
 */
function computeHarvestForecast(params) {
    const {
        sowingDate,
        avgMaturityDays,
        cultivatedArea,
        avgYieldPerHectare,
        farmerReadinessScore,
        weatherDeviationFlag,
        transportCapacity
    } = params;

    // Step 1: Calculate expected harvest date
    const expectedHarvestDate = calculateExpectedHarvestDate(sowingDate, avgMaturityDays);
    const today = new Date();
    const daysToHarvest = getDaysToHarvest(expectedHarvestDate, today);

    // Step 2: Calculate maturity score
    const maturityScore = calculateMaturityScore(daysToHarvest);

    // Step 3: Get weather modifier
    const weatherModifier = getWeatherModifier(weatherDeviationFlag);

    // Step 4: Compute readiness index
    const readinessIndex = computeReadinessIndex(
        farmerReadinessScore,
        maturityScore,
        weatherModifier
    );

    // Step 5: Calculate volumes
    const baseVolume = calculateBaseVolume(cultivatedArea, avgYieldPerHectare);
    const forecastedVolume = calculateForecastedVolume(baseVolume, readinessIndex);

    // Step 6: Classify harvest level
    const harvestLevel = classifyHarvestLevel(forecastedVolume, transportCapacity);

    // Calculate confidence score based on data quality
    const confidenceScore = Math.min(0.95, 0.5 + (farmerReadinessScore * 0.3) + (maturityScore * 0.15));

    return {
        expected_harvest_date: expectedHarvestDate.toISOString().split('T')[0],
        days_to_harvest: daysToHarvest,
        maturity_score: Math.round(maturityScore * 100) / 100,
        weather_modifier: weatherModifier,
        readiness_index: Math.round(readinessIndex * 1000) / 1000,
        base_volume_tonnes: Math.round(baseVolume * 100) / 100,
        forecasted_harvest_volume: Math.round(forecastedVolume * 100) / 100,
        harvest_level: harvestLevel,
        confidence_score: Math.round(confidenceScore * 100) / 100,
        forecast_window_days: FORECAST_WINDOW
    };
}

/**
 * Aggregate forecasts from multiple farmers
 * @param {Array} farmerForecasts - Array of individual farmer forecasts
 * @returns {Object} Aggregated forecast data
 */
function aggregateForecasts(farmerForecasts) {
    const totalVolume = farmerForecasts.reduce((sum, f) => sum + f.forecasted_harvest_volume, 0);
    const avgConfidence = farmerForecasts.reduce((sum, f) => sum + f.confidence_score, 0) / farmerForecasts.length;

    return {
        total_forecasted_volume: Math.round(totalVolume * 100) / 100,
        farmer_count: farmerForecasts.length,
        average_confidence: Math.round(avgConfidence * 100) / 100,
        individual_forecasts: farmerForecasts
    };
}

module.exports = {
    computeHarvestForecast,
    aggregateForecasts,
    calculateExpectedHarvestDate,
    getDaysToHarvest,
    classifyHarvestLevel,
    getWeatherModifier,
    FORECAST_WINDOW
};

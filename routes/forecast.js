/**
 * Forecast Routes
 * 
 * Endpoints for harvest forecast, logistics stress, and storage allocation
 */

const express = require('express');
const router = express.Router();

const { computeHarvestForecast, aggregateForecasts } = require('../engine/harvestForecast');
const { assessLogistics } = require('../engine/logisticsStress');
const { assessStorageAllocation, aggregateStorageFacilities } = require('../engine/storageAllocation');
const { crops, regions, farmers, storageFacilities, weatherData } = require('../data/sampleData');

/**
 * POST /api/forecast/harvest
 * Compute harvest forecast for a specific farmer or all farmers
 */
router.post('/harvest', (req, res) => {
    try {
        const { farmer_id, weather_deviation } = req.body;

        // Get region and crop data (MVP: single region and crop)
        const region = regions[0];
        const crop = crops[0];
        const weather = weatherData[region.region_id];
        const weatherFlag = weather_deviation !== undefined ? weather_deviation : weather.deviation_flag;

        let targetFarmers;
        if (farmer_id) {
            targetFarmers = farmers.filter(f => f.farmer_id === farmer_id);
            if (targetFarmers.length === 0) {
                return res.status(404).json({ success: false, error: 'Farmer not found' });
            }
        } else {
            targetFarmers = farmers;
        }

        // Compute forecast for each farmer
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

        // Aggregate if multiple farmers
        const aggregated = aggregateForecasts(farmerForecasts);

        res.json({
            success: true,
            data: {
                crop: crop.crop_type,
                region: region.name,
                weather_condition: weatherFlag === 0 ? 'Normal' : (weatherFlag === 1 ? 'Favorable' : 'Adverse'),
                ...aggregated
            }
        });

    } catch (error) {
        console.error('Harvest forecast error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/forecast/logistics
 * Get logistics stress assessment
 */
router.post('/logistics', (req, res) => {
    try {
        const { forecasted_volume, weather_deviation } = req.body;

        const region = regions[0];
        const crop = crops[0];
        const weather = weatherData[region.region_id];
        const weatherFlag = weather_deviation !== undefined ? weather_deviation : weather.deviation_flag;

        // If no volume provided, calculate from all farmers
        let volume = forecasted_volume;
        if (volume === undefined) {
            const farmerForecasts = farmers.map(farmer => {
                return computeHarvestForecast({
                    sowingDate: farmer.sowing_date,
                    avgMaturityDays: crop.avg_maturity_days,
                    cultivatedArea: farmer.cultivated_area,
                    avgYieldPerHectare: crop.avg_yield_per_hectare,
                    farmerReadinessScore: farmer.readiness_score,
                    weatherDeviationFlag: weatherFlag,
                    transportCapacity: region.transport_capacity_per_day
                });
            });
            volume = farmerForecasts.reduce((sum, f) => sum + f.forecasted_harvest_volume, 0);
        }

        const logistics = assessLogistics({
            forecastedVolume: volume,
            transportCapacity: region.transport_capacity_per_day,
            regionId: region.region_id
        });

        res.json({
            success: true,
            data: {
                crop: crop.crop_type,
                region: region.name,
                ...logistics
            }
        });

    } catch (error) {
        console.error('Logistics assessment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/forecast/storage
 * Get storage allocation recommendation
 */
router.post('/storage', (req, res) => {
    try {
        const { forecasted_volume, weather_deviation } = req.body;

        const region = regions[0];
        const crop = crops[0];
        const weather = weatherData[region.region_id];
        const weatherFlag = weather_deviation !== undefined ? weather_deviation : weather.deviation_flag;

        // Aggregate storage facilities
        const aggregatedStorage = aggregateStorageFacilities(storageFacilities);

        // If no volume provided, calculate from all farmers
        let volume = forecasted_volume;
        if (volume === undefined) {
            const farmerForecasts = farmers.map(farmer => {
                return computeHarvestForecast({
                    sowingDate: farmer.sowing_date,
                    avgMaturityDays: crop.avg_maturity_days,
                    cultivatedArea: farmer.cultivated_area,
                    avgYieldPerHectare: crop.avg_yield_per_hectare,
                    farmerReadinessScore: farmer.readiness_score,
                    weatherDeviationFlag: weatherFlag,
                    transportCapacity: region.transport_capacity_per_day
                });
            });
            volume = farmerForecasts.reduce((sum, f) => sum + f.forecasted_harvest_volume, 0);
        }

        const storage = assessStorageAllocation({
            forecastedVolume: volume,
            transportCapacity: region.transport_capacity_per_day,
            totalStorageCapacity: aggregatedStorage.total_capacity,
            currentStorageUsage: aggregatedStorage.total_usage
        });

        res.json({
            success: true,
            data: {
                crop: crop.crop_type,
                region: region.name,
                facilities: aggregatedStorage,
                ...storage
            }
        });

    } catch (error) {
        console.error('Storage assessment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/forecast/dashboard
 * Unified dashboard - combines all forecasts into single response
 */
router.post('/dashboard', (req, res) => {
    try {
        const { farmer_id, weather_deviation } = req.body;

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

        // Build unified response
        res.json({
            success: true,
            data: {
                // Header info
                crop: crop.crop_type,
                region: region.name,
                forecast_window: 5,
                generated_at: new Date().toISOString(),

                // Summary metrics
                summary: {
                    harvest_level: overallHarvestLevel,
                    forecasted_harvest_volume: totalVolume,
                    logistics_stress_level: logistics.logistics_stress_level,
                    storage_action: storage.allocation_decision.storage_action,
                    storage_reserve_percentage: storage.allocation_decision.storage_reserve_percentage
                },

                // Weather context
                weather: {
                    condition: weatherFlag === 0 ? 'Normal' : (weatherFlag === 1 ? 'Favorable' : 'Adverse'),
                    deviation_flag: weatherFlag,
                    forecast: weather.forecast
                },

                // Detailed breakdowns
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

                // Combined advisories
                advisories: allAdvisories
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

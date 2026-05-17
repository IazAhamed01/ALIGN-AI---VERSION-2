/**
 * Data Routes
 * 
 * Endpoints for managing crops, regions, storage, and farmer data
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { crops, regions, farmers, storageFacilities, weatherData } = require('../data/sampleData');

// In-memory storage for new farmer additions (demo purposes)
let farmerData = [...farmers];

/**
 * GET /api/data/crops
 * List available crops (MVP: only tomato)
 */
router.get('/crops', (req, res) => {
    res.json({
        success: true,
        data: {
            count: crops.length,
            crops: crops
        }
    });
});

/**
 * GET /api/data/crops/:id
 * Get specific crop details
 */
router.get('/crops/:id', (req, res) => {
    const crop = crops.find(c => c.crop_id === req.params.id.toUpperCase());
    if (!crop) {
        return res.status(404).json({ success: false, error: 'Crop not found' });
    }
    res.json({ success: true, data: crop });
});

/**
 * GET /api/data/regions
 * List available regions
 */
router.get('/regions', (req, res) => {
    res.json({
        success: true,
        data: {
            count: regions.length,
            regions: regions
        }
    });
});

/**
 * GET /api/data/regions/:id
 * Get specific region details with weather
 */
router.get('/regions/:id', (req, res) => {
    const region = regions.find(r => r.region_id === req.params.id.toUpperCase());
    if (!region) {
        return res.status(404).json({ success: false, error: 'Region not found' });
    }

    const weather = weatherData[region.region_id];
    res.json({
        success: true,
        data: {
            ...region,
            weather: weather
        }
    });
});

/**
 * GET /api/data/storage
 * Get all storage facilities
 */
router.get('/storage', (req, res) => {
    const facilitiesWithAvailability = storageFacilities.map(f => ({
        ...f,
        available_capacity: f.total_capacity - f.current_usage,
        utilization_percent: Math.round((f.current_usage / f.total_capacity) * 100)
    }));

    const totalCapacity = storageFacilities.reduce((sum, f) => sum + f.total_capacity, 0);
    const totalUsage = storageFacilities.reduce((sum, f) => sum + f.current_usage, 0);

    res.json({
        success: true,
        data: {
            count: storageFacilities.length,
            total_capacity: totalCapacity,
            total_usage: totalUsage,
            total_available: totalCapacity - totalUsage,
            overall_utilization_percent: Math.round((totalUsage / totalCapacity) * 100),
            facilities: facilitiesWithAvailability
        }
    });
});

/**
 * GET /api/data/storage/:id
 * Get specific storage facility
 */
router.get('/storage/:id', (req, res) => {
    const facility = storageFacilities.find(f => f.storage_id === req.params.id.toUpperCase());
    if (!facility) {
        return res.status(404).json({ success: false, error: 'Storage facility not found' });
    }

    res.json({
        success: true,
        data: {
            ...facility,
            available_capacity: facility.total_capacity - facility.current_usage,
            utilization_percent: Math.round((facility.current_usage / facility.total_capacity) * 100)
        }
    });
});

/**
 * GET /api/data/farmers
 * List all farmers
 */
router.get('/farmers', (req, res) => {
    // Calculate total cultivated area
    const totalArea = farmerData.reduce((sum, f) => sum + f.cultivated_area, 0);
    const avgReadiness = farmerData.reduce((sum, f) => sum + f.readiness_score, 0) / farmerData.length;

    res.json({
        success: true,
        data: {
            count: farmerData.length,
            total_cultivated_area: totalArea,
            average_readiness_score: Math.round(avgReadiness * 100) / 100,
            farmers: farmerData.map(f => ({
                farmer_id: f.farmer_id,
                name: f.name,
                region_id: f.region_id,
                crop_id: f.crop_id,
                sowing_date: f.sowing_date,
                cultivated_area: f.cultivated_area,
                readiness_score: f.readiness_score
            }))
        }
    });
});

/**
 * GET /api/data/farmers/:id
 * Get specific farmer details
 */
router.get('/farmers/:id', (req, res) => {
    const farmer = farmerData.find(f => f.farmer_id === req.params.id.toUpperCase());
    if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
    }

    // Get associated crop and region
    const crop = crops.find(c => c.crop_id === farmer.crop_id);
    const region = regions.find(r => r.region_id === farmer.region_id);

    res.json({
        success: true,
        data: {
            ...farmer,
            crop_details: crop,
            region_details: region
        }
    });
});

/**
 * POST /api/data/farmers
 * Add a new farmer input
 */
router.post('/farmers', (req, res) => {
    try {
        const {
            name,
            region_id = 'DIST001',
            crop_id = 'TOMATO',
            sowing_date,
            cultivated_area,
            readiness_score,
            contact
        } = req.body;

        // Validation
        if (!name || !sowing_date || !cultivated_area) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: name, sowing_date, cultivated_area'
            });
        }

        if (readiness_score !== undefined && (readiness_score < 0 || readiness_score > 1)) {
            return res.status(400).json({
                success: false,
                error: 'readiness_score must be between 0 and 1'
            });
        }

        // Create new farmer
        const newFarmer = {
            farmer_id: `F${String(farmerData.length + 1).padStart(3, '0')}`,
            name,
            region_id: region_id.toUpperCase(),
            crop_id: crop_id.toUpperCase(),
            sowing_date,
            cultivated_area: parseFloat(cultivated_area),
            readiness_score: readiness_score !== undefined ? parseFloat(readiness_score) : 0.5,
            contact: contact || null,
            created_at: new Date().toISOString()
        };

        farmerData.push(newFarmer);

        res.status(201).json({
            success: true,
            message: 'Farmer added successfully',
            data: newFarmer
        });

    } catch (error) {
        console.error('Add farmer error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/data/farmers/:id
 * Update farmer readiness score
 */
router.put('/farmers/:id', (req, res) => {
    const farmerIndex = farmerData.findIndex(f => f.farmer_id === req.params.id.toUpperCase());
    if (farmerIndex === -1) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
    }

    const { readiness_score, cultivated_area, sowing_date } = req.body;

    if (readiness_score !== undefined) {
        if (readiness_score < 0 || readiness_score > 1) {
            return res.status(400).json({
                success: false,
                error: 'readiness_score must be between 0 and 1'
            });
        }
        farmerData[farmerIndex].readiness_score = parseFloat(readiness_score);
    }

    if (cultivated_area !== undefined) {
        farmerData[farmerIndex].cultivated_area = parseFloat(cultivated_area);
    }

    if (sowing_date !== undefined) {
        farmerData[farmerIndex].sowing_date = sowing_date;
    }

    farmerData[farmerIndex].updated_at = new Date().toISOString();

    res.json({
        success: true,
        message: 'Farmer updated successfully',
        data: farmerData[farmerIndex]
    });
});

/**
 * GET /api/data/weather
 * Get weather data for all regions
 */
router.get('/weather', (req, res) => {
    res.json({
        success: true,
        data: weatherData
    });
});

/**
 * GET /api/data/summary
 * Get overall system summary
 */
router.get('/summary', (req, res) => {
    const totalFarmers = farmerData.length;
    const totalArea = farmerData.reduce((sum, f) => sum + f.cultivated_area, 0);
    const totalStorageCapacity = storageFacilities.reduce((sum, f) => sum + f.total_capacity, 0);
    const totalStorageUsage = storageFacilities.reduce((sum, f) => sum + f.current_usage, 0);

    res.json({
        success: true,
        data: {
            crops: {
                count: crops.length,
                active: crops.map(c => c.crop_type)
            },
            regions: {
                count: regions.length,
                active: regions.map(r => r.name)
            },
            farmers: {
                count: totalFarmers,
                total_cultivated_area: totalArea
            },
            storage: {
                facility_count: storageFacilities.length,
                total_capacity: totalStorageCapacity,
                current_usage: totalStorageUsage,
                available: totalStorageCapacity - totalStorageUsage
            },
            transport: {
                total_capacity_per_day: regions.reduce((sum, r) => sum + r.transport_capacity_per_day, 0)
            }
        }
    });
});

module.exports = router;

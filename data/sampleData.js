/**
 * AlignAI - Sample Data for MVP Demo
 * Single crop (Tomato), Single district, 3-5 day forecast horizon
 */

// Crop profiles (MVP: only tomato)
const crops = [
    {
        crop_id: 'TOMATO',
        crop_type: 'Tomato',
        avg_maturity_days: 90,
        avg_yield_per_hectare: 25, // tonnes
        category: 'Perishable',
        shelf_life_days: 7
    }
];

// Region data (MVP: single district)
const regions = [
    {
        region_id: 'DIST001',
        name: 'Nashik District',
        state: 'Maharashtra',
        transport_capacity_per_day: 100, // tonnes
        typical_harvest_window: 'Oct-Feb'
    }
];

// Farmer inputs (sample data for demo)
const farmers = [
    {
        farmer_id: 'F001',
        name: 'Ramesh Patil',
        region_id: 'DIST001',
        crop_id: 'TOMATO',
        sowing_date: '2025-10-15',
        cultivated_area: 2.5, // hectares
        readiness_score: 0.85,
        contact: '+91-9876543210'
    },
    {
        farmer_id: 'F002',
        name: 'Suresh Jadhav',
        region_id: 'DIST001',
        crop_id: 'TOMATO',
        sowing_date: '2025-10-20',
        cultivated_area: 1.8,
        readiness_score: 0.70,
        contact: '+91-9876543211'
    },
    {
        farmer_id: 'F003',
        name: 'Vijay Shinde',
        region_id: 'DIST001',
        crop_id: 'TOMATO',
        sowing_date: '2025-10-10',
        cultivated_area: 3.2,
        readiness_score: 0.95,
        contact: '+91-9876543212'
    }
];

// Cold storage facilities
const storageFacilities = [
    {
        storage_id: 'CS001',
        name: 'Nashik Cold Storage Hub',
        region_id: 'DIST001',
        total_capacity: 500, // tonnes
        current_usage: 150, // tonnes
        type: 'Cold Storage',
        temperature_range: '4-8°C'
    },
    {
        storage_id: 'CS002',
        name: 'Sinnar Agri Warehouse',
        region_id: 'DIST001',
        total_capacity: 300,
        current_usage: 100,
        type: 'Cold Storage',
        temperature_range: '4-8°C'
    }
];

// Weather data (simulated for demo)
const weatherData = {
    DIST001: {
        region_id: 'DIST001',
        deviation_flag: 0, // -1 = adverse, 0 = normal, +1 = favorable
        forecast: 'Normal conditions expected for next 5 days',
        temperature_avg: 28,
        humidity_avg: 65
    }
};

module.exports = {
    crops,
    regions,
    farmers,
    storageFacilities,
    weatherData
};

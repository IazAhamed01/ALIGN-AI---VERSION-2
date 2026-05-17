import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import ContextualAI from '../components/ContextualAI'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Truck, Search, Signal, SignalZero, MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './Logistics.css'

// Sample vehicle data
const vehicles = [
    {
        id: 'MH 12 KD 8324',
        status: 'disconnected',
        location: 'Domlur Layout, Whitefield, Bengaluru',
        lat: 12.9716,
        lng: 77.6411,
        speed: 0,
        traveled: 250,
        issue: 'Wire disconnected since 8 days'
    },
    {
        id: 'KA 86 GM 8765',
        status: 'stopped',
        location: 'Inner Valley, Whitefield, Bengaluru',
        lat: 12.9698,
        lng: 77.7500,
        speed: 0,
        traveled: 250,
        issue: 'Stopped since 1h 45m'
    },
    {
        id: 'TN 12 DK 9876',
        status: 'moving',
        location: 'Old Madras Road, Whitefield, Bengaluru',
        lat: 12.9850,
        lng: 77.7600,
        speed: 80.54,
        traveled: 1250.45,
        issue: 'Moving since 1h 20m'
    },
    {
        id: 'GJ 12 DK 8324',
        status: 'stopped',
        location: 'SH 35, Inner Valley, Bengaluru',
        lat: 12.9620,
        lng: 77.7450,
        speed: 0,
        traveled: 250,
        issue: 'Stopped since 1h 45m'
    },
]

const filters = [
    { id: 'all', label: 'All', count: 16 },
    { id: 'stopped', label: 'Stopped', count: 8 },
    { id: 'moving', label: 'Moving', count: 2 },
    { id: 'lowNetwork', label: 'Low Network', count: 0 },
    { id: 'disconnected', label: 'Wire Disconnected', count: 6 },
]

function Logistics() {
    const { language } = useLanguage()
    const [activeFilter, setActiveFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredVehicles = vehicles.filter(v => {
        if (activeFilter !== 'all' && v.status !== activeFilter) return false
        if (searchQuery && !v.id.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'moving': return 'success'
            case 'stopped': return 'warning'
            case 'disconnected': return 'error'
            default: return 'neutral'
        }
    }

    // Logistics context for AI
    const logisticsContext = {
        transportType: 'Truck',
        route: 'Kalaburagi to Bangalore',
        volume: 250,
        commodity: 'Onions',
        totalVehicles: 16,
        movingVehicles: 2,
        stoppedVehicles: 8,
        disconnectedVehicles: 6,
        avgSpeed: '80.54 km/h',
        distanceTraveled: '1250 km'
    }

    return (
        <div className="logistics page">
            <div className="container-fluid">
                {/* Header */}
                <div className="logistics-header">
                    <div className="header-badges">
                        <img src="/assets/align-logo.jpg" alt="Align" className="logo-mini" />
                        <img src="/assets/ulip-logo.png" alt="ULIP" className="partner-logo" />
                    </div>
                    <div className="header-title-row">
                        <h1>Logistics & Tracking</h1>
                        <ContextualAI
                            domain="logistics"
                            context={logisticsContext}
                            language={language}
                            mode="button"
                        />
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="search-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search Truck Number in GPS"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div className="filter-tabs">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                className={`tab ${activeFilter === filter.id ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter.id)}
                            >
                                {filter.label}({filter.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="logistics-content">
                    {/* Vehicle List */}
                    <div className="vehicle-list">
                        {filteredVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="vehicle-card">
                                <div className="vehicle-header">
                                    <div className="vehicle-id">
                                        <strong>{vehicle.id}</strong>
                                        <span className="vehicle-time">Today, 5:30PM</span>
                                    </div>
                                    <div className="vehicle-signal">
                                        {vehicle.status === 'moving' ? (
                                            <Signal size={16} className="signal-on" />
                                        ) : (
                                            <SignalZero size={16} className="signal-off" />
                                        )}
                                    </div>
                                </div>
                                <div className="vehicle-location">
                                    <MapPin size={14} />
                                    <span>{vehicle.location}</span>
                                </div>
                                <div className={`vehicle-issue ${getStatusColor(vehicle.status)}`}>
                                    {vehicle.issue}
                                </div>
                                <div className="vehicle-stats">
                                    <div className="v-stat">
                                        <span className="v-label">Ignition</span>
                                        <span className={`v-value ${vehicle.speed > 0 ? 'on' : 'off'}`}>
                                            {vehicle.speed > 0 ? 'ON' : 'OFF'}
                                        </span>
                                    </div>
                                    <div className="v-stat">
                                        <span className="v-label">Speed</span>
                                        <span className="v-value">{vehicle.speed} km/h</span>
                                    </div>
                                    <div className="v-stat">
                                        <span className="v-label">Travelled today</span>
                                        <span className="v-value">{vehicle.traveled} km</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Map */}
                    <div className="logistics-map">
                        <MapContainer
                            center={[12.97, 77.75]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {filteredVehicles.map((vehicle) => (
                                <Marker key={vehicle.id} position={[vehicle.lat, vehicle.lng]}>
                                    <Popup>
                                        <strong>{vehicle.id}</strong>
                                        <p>Status: {vehicle.status}</p>
                                        <p>Speed: {vehicle.speed} km/h</p>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Logistics

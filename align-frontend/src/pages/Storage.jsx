import { useEffect, useState } from 'react'
import { useGlobalState } from '../context/GlobalState'
import { useLanguage } from '../context/LanguageContext'
import ContextualAI from '../components/ContextualAI'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Warehouse, Snowflake, Thermometer, Building2, Cylinder } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './Storage.css'

// Fix for default marker icon
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function Storage() {
    const { state, fetchStorage } = useGlobalState()
    const { language, t } = useLanguage()
    const [activeFilter, setActiveFilter] = useState('all')
    const [loading, setLoading] = useState(true)

    const facilityTypes = [
        { id: 'all', label: t?.storage?.allFacilities || 'All Facilities', icon: Building2, count: 8 },
        { id: 'cold', label: t?.storage?.coldStorage || 'Cold Storage', icon: Snowflake, count: 3 },
        { id: 'hot', label: t?.storage?.hotStorage || 'Hot Storage', icon: Thermometer, count: 2 },
        { id: 'warehouse', label: t?.storage?.warehouses || 'Warehouses', icon: Warehouse, count: 2 },
        { id: 'silo', label: t?.storage?.silos || 'Silos', icon: Cylinder, count: 1 },
    ]

    useEffect(() => {
        const load = async () => {
            await fetchStorage()
            setLoading(false)
        }
        load()
    }, [fetchStorage])

    const filteredFacilities = activeFilter === 'all'
        ? facilitiesData
        : facilitiesData.filter(f => f.type === activeFilter)

    // Storage context for AI
    const storageContext = {
        storageType: 'Cold Storage',
        capacity: 1000,
        currentStock: 330,
        commodity: 'Onions',
        facilities: 8,
        coldStorage: 3,
        warehouses: 2,
        utilizationRate: '33%',
        availableCapacity: 670
    }

    return (
        <div className="storage page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-badges">
                        <img src="/assets/align-logo.jpg" alt="Align" className="logo-mini" />
                        <img src="/assets/ulip-logo.png" alt="ULIP" className="partner-logo" />
                    </div>
                    <div className="header-title-row">
                        <h1>{t?.storage?.title || 'Storage Facilities'}</h1>
                        <ContextualAI
                            domain="storage"
                            context={storageContext}
                            language={language}
                            mode="button"
                        />
                    </div>
                    <p className="text-muted">{t?.storage?.subtitle || 'Real-time visibility into storage capacity'}</p>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {facilityTypes.map((type) => (
                        <button
                            key={type.id}
                            className={`tab ${activeFilter === type.id ? 'active' : ''}`}
                            onClick={() => setActiveFilter(type.id)}
                        >
                            <type.icon size={16} />
                            {type.label} ({type.count})
                        </button>
                    ))}
                </div>

                {/* Legend */}
                <div className="map-legend">
                    <span className="legend-title">{t?.storage?.legend || 'Legend:'}</span>
                    <span className="legend-item"><span className="legend-dot cold"></span> {t?.storage?.coldStorage || 'Cold Storage'}</span>
                    <span className="legend-item"><span className="legend-dot hot"></span> {t?.storage?.hotStorage || 'Hot Storage'}</span>
                    <span className="legend-item"><span className="legend-dot warehouse"></span> {t?.storage?.warehouses || 'Warehouse'}</span>
                    <span className="legend-item"><span className="legend-dot silo"></span> {t?.storage?.silos || 'Silo'}</span>
                </div>

                {/* Map */}
                <div className="map-container">
                    <MapContainer
                        center={[20.0, 73.8]}
                        zoom={10}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {filteredFacilities.map((facility) => (
                            <Marker key={facility.id} position={[facility.lat, facility.lng]}>
                                <Popup>
                                    <div className="popup-content">
                                        <strong>{facility.name}</strong>
                                        <p>{t?.storage?.type || 'Type:'} {facility.type}</p>
                                        <p>{t?.storage?.capacity || 'Capacity:'} {facility.capacity} {t?.storage?.tonnes || 'tonnes'}</p>
                                        <p>{t?.storage?.used || 'Used:'} {facility.usage} {t?.storage?.tonnes || 'tonnes'}</p>
                                        <p>{t?.storage?.available || 'Available:'} {facility.capacity - facility.usage} {t?.storage?.tonnes || 'tonnes'}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Facility Cards */}
                <div className="facilities-grid">
                    {state.storageFacilities?.facilities?.map((facility) => (
                        <div key={facility.storage_id} className="facility-card card">
                            <div className="facility-header">
                                <Warehouse size={20} />
                                <h4>{facility.name}</h4>
                            </div>
                            <div className="facility-bar">
                                <div
                                    className="facility-fill"
                                    style={{ width: `${(facility.current_usage / facility.total_capacity) * 100}%` }}
                                ></div>
                            </div>
                            <div className="facility-stats">
                                <div className="facility-stat">
                                    <span className="stat-value">{facility.total_capacity}</span>
                                    <span className="stat-label">{t?.storage?.totalT || 'Total (t)'}</span>
                                </div>
                                <div className="facility-stat">
                                    <span className="stat-value">{facility.current_usage}</span>
                                    <span className="stat-label">{t?.storage?.usedT || 'Used (t)'}</span>
                                </div>
                                <div className="facility-stat">
                                    <span className="stat-value">{facility.total_capacity - facility.current_usage}</span>
                                    <span className="stat-label">{t?.storage?.availableT || 'Available (t)'}</span>
                                </div>
                            </div>
                            <div className="facility-meta">
                                <span className="badge badge-info">{facility.type}</span>
                                <span className="temp-range">{facility.temperature_range}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default Storage

import { useEffect, useState } from 'react'
import { useGlobalState } from '../context/GlobalState'
import { useLanguage } from '../context/LanguageContext'
import ContextualAI from '../components/ContextualAI'
import {
    Users,
    Calendar,
    MapPin,
    TrendingUp,
    Droplets,
    Bug,
    DollarSign
} from 'lucide-react'
import './Farmers.css'

// Mock chart data for demo
const historicalData = [15, 25, 35, 45, 55, 70, 75, 80, 72, 78]
const varieties = [
    { name: 'Bhima Shakti', percentage: 30, color: '#F59E0B' },
    { name: 'Agrifound Dark Red', percentage: 40, color: '#3B82F6' },
    { name: 'N-53', percentage: 20, color: '#10B981' },
    { name: 'Other', percentage: 10, color: '#6B7280' }
]

function Farmers() {
    const { state, fetchFarmers } = useGlobalState()
    const { language } = useLanguage()
    const { farmerInputs } = state
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            await fetchFarmers()
            setLoading(false)
        }
        load()
    }, [fetchFarmers])

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading-state">
                        <div className="loader loader-lg"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Farming context for AI
    const farmingContext = {
        cropType: 'Onion',
        location: 'Kalaburagi, Karnataka',
        harvestDate: 'March-April 2025',
        soilType: 'Black soil',
        irrigation: 'Drip irrigation',
        estimatedYield: '1.2M tons',
        soilMoisture: '65%',
        pestRisk: 'Low',
        marketPrice: '₹25/kg'
    }

    return (
        <div className="farmers page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div className="header-badges">
                            <img src="/assets/align-logo.jpg" alt="Align" className="logo-mini" />
                            <img src="/assets/agristack-logo.jpg" alt="AgriStack" className="partner-logo" />
                        </div>
                        <div className="header-title-row">
                            <h1>Farmer Registry</h1>
                            <ContextualAI
                                domain="farmers"
                                context={farmingContext}
                                language={language}
                                mode="button"
                            />
                        </div>
                        <p className="text-muted">Harvest intent signals and readiness scores</p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="summary-row">
                    <div className="big-stat">
                        <div className="big-stat-value">1.2M</div>
                        <div className="big-stat-label">EST. YIELD TONS (2024-25)</div>
                    </div>
                    <div className="gauge-stats">
                        <div className="gauge-stat">
                            <div className="gauge-circle green">
                                <span>65%</span>
                            </div>
                            <div className="gauge-label">SOIL MOISTURE</div>
                        </div>
                        <div className="gauge-stat">
                            <div className="gauge-circle yellow">
                                <span>65%</span>
                            </div>
                            <div className="gauge-label">PEST RISK<br />LOW</div>
                        </div>
                        <div className="gauge-stat">
                            <div className="gauge-circle red">
                                <span>30%</span>
                            </div>
                            <div className="gauge-label">MARKET PRICE<br />₹25/KG</div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="charts-row">
                    {/* Historical Production */}
                    <div className="chart-card card">
                        <h3>HISTORICAL PRODUCTION (LAST 5 YEARS)</h3>
                        <div className="chart-area">
                            <svg viewBox="0 0 200 100" className="line-chart">
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={`M 0 ${100 - historicalData[0]} ${historicalData.map((d, i) => `L ${i * 22} ${100 - d}`).join(' ')} L 198 100 L 0 100 Z`}
                                    fill="url(#areaGradient)"
                                />
                                <path
                                    d={`M 0 ${100 - historicalData[0]} ${historicalData.map((d, i) => `L ${i * 22} ${100 - d}`).join(' ')}`}
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Cultivation Timeline */}
                    <div className="chart-card card">
                        <h3>CULTIVATION TIMELINE (2024-25)</h3>
                        <div className="timeline">
                            <div className="timeline-track">
                                <div className="timeline-progress" style={{ width: '60%' }}></div>
                            </div>
                            <div className="timeline-stages">
                                <div className="stage active">
                                    <Calendar size={16} />
                                    <span>PLANTING</span>
                                    <small>OCT-NOV</small>
                                </div>
                                <div className="stage active">
                                    <Droplets size={16} />
                                    <span>GROWTH</span>
                                    <small>DEC-FEB</small>
                                </div>
                                <div className="stage">
                                    <TrendingUp size={16} />
                                    <span>HARVEST</span>
                                    <small>MAR-APR</small>
                                </div>
                                <div className="stage">
                                    <MapPin size={16} />
                                    <span>STORAGE</span>
                                    <small>MAY-JUN</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="bottom-row">
                    {/* Variety Breakdown */}
                    <div className="chart-card card">
                        <h3>VARIETY BREAKDOWN</h3>
                        <div className="variety-chart">
                            {varieties.map((v, i) => (
                                <div key={i} className="variety-bar">
                                    <div
                                        className="variety-fill"
                                        style={{ height: `${v.percentage * 1.5}px`, background: v.color }}
                                    ></div>
                                    <span className="variety-pct">{v.percentage}%</span>
                                    <span className="variety-name">{v.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Indicators */}
                    <div className="chart-card card">
                        <h3>RISK INDICATORS</h3>
                        <div className="risk-list">
                            <div className="risk-item warning">
                                <Droplets size={18} />
                                <div>
                                    <strong>DROUGHT ALERT:</strong>
                                    <span>MODERATE</span>
                                </div>
                            </div>
                            <div className="risk-item info">
                                <TrendingUp size={18} />
                                <div>
                                    <strong>RAINFALL FORECAST:</strong>
                                    <span>BELOW AVG</span>
                                </div>
                            </div>
                            <div className="risk-item success">
                                <Bug size={18} />
                                <div>
                                    <strong>PEST OUTBREAK:</strong>
                                    <span>MINOR LOCALIZED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Farmer Cards */}
                <div className="farmers-section">
                    <h3><Users size={20} /> Registered Farmers</h3>
                    <div className="farmers-grid">
                        {farmerInputs.map((farmer) => (
                            <div key={farmer.farmer_id} className="farmer-card card">
                                <div className="farmer-header">
                                    <div className="farmer-avatar">
                                        {farmer.name?.charAt(0)}
                                    </div>
                                    <div className="farmer-info">
                                        <h4>{farmer.name}</h4>
                                        <span className="farmer-id">{farmer.farmer_id}</span>
                                    </div>
                                    <span className={`badge badge-${farmer.readiness_score >= 0.8 ? 'success' : farmer.readiness_score >= 0.6 ? 'warning' : 'neutral'}`}>
                                        {Math.round(farmer.readiness_score * 100)}% Ready
                                    </span>
                                </div>
                                <div className="farmer-stats">
                                    <div className="farmer-stat">
                                        <Calendar size={14} />
                                        <span>Sowing: {farmer.sowing_date}</span>
                                    </div>
                                    <div className="farmer-stat">
                                        <MapPin size={14} />
                                        <span>Area: {farmer.cultivated_area} ha</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Farmers

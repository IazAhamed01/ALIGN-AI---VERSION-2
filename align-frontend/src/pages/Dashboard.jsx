import { useEffect } from 'react'
import { useGlobalState } from '../context/GlobalState'
import {
    Play,
    RefreshCw,
    TrendingUp,
    Truck,
    Warehouse,
    AlertTriangle,
    CheckCircle,
    Info,
    Clock
} from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
    const { state, runCoordination, fetchSystemSummary } = useGlobalState()
    const { dashboardResult, systemSummary, uiStatus } = state

    useEffect(() => {
        if (!systemSummary) {
            fetchSystemSummary()
        }
    }, [systemSummary, fetchSystemSummary])

    const getStressColor = (level) => {
        switch (level) {
            case 'HIGH': return 'error'
            case 'ELEVATED': return 'warning'
            default: return 'success'
        }
    }

    const getActionColor = (action) => {
        if (action?.includes('IMMEDIATELY')) return 'error'
        if (action?.includes('URGENT') || action?.includes('PARTIAL')) return 'warning'
        return 'success'
    }

    return (
        <div className="dashboard page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Coordination Dashboard</h1>
                        <p className="text-muted">
                            Future-aware coordination for harvest forecasting, logistics, and storage
                        </p>
                    </div>

                    <button
                        className="btn btn-primary btn-lg run-btn"
                        onClick={runCoordination}
                        disabled={uiStatus.loading}
                    >
                        {uiStatus.loading ? (
                            <>
                                <RefreshCw size={20} className="spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Play size={20} />
                                Run Coordination
                            </>
                        )}
                    </button>
                </div>

                {/* Error Display */}
                {uiStatus.error && (
                    <div className="error-banner">
                        <AlertTriangle size={20} />
                        {uiStatus.error}
                    </div>
                )}

                {/* Last Updated */}
                {uiStatus.lastUpdated && (
                    <div className="last-updated">
                        <Clock size={14} />
                        Last updated: {new Date(uiStatus.lastUpdated).toLocaleString()}
                    </div>
                )}

                {/* Loading State */}
                {uiStatus.loading && !dashboardResult && (
                    <div className="loading-state">
                        <div className="loader loader-lg"></div>
                        <p>Running coordination analysis...</p>
                    </div>
                )}

                {/* Dashboard Content */}
                {dashboardResult && (
                    <>
                        {/* Context Bar */}
                        <div className="context-bar">
                            <div className="context-item">
                                <span className="context-label">Crop</span>
                                <span className="context-value">{dashboardResult.crop}</span>
                            </div>
                            <div className="context-item">
                                <span className="context-label">Region</span>
                                <span className="context-value">{dashboardResult.region}</span>
                            </div>
                            <div className="context-item">
                                <span className="context-label">Forecast Window</span>
                                <span className="context-value">{dashboardResult.forecast_window} Days</span>
                            </div>
                            <div className="context-item">
                                <span className="context-label">Weather</span>
                                <span className="context-value">{dashboardResult.weather?.condition}</span>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="summary-grid">
                            <div className="summary-card">
                                <div className="summary-icon harvest">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="summary-content">
                                    <div className="summary-value">
                                        {dashboardResult.summary.forecasted_harvest_volume}
                                        <span className="summary-unit">tonnes</span>
                                    </div>
                                    <div className="summary-label">Forecasted Harvest</div>
                                    <span className={`badge badge-${dashboardResult.summary.harvest_level === 'HIGH' ? 'error' : dashboardResult.summary.harvest_level === 'MEDIUM' ? 'warning' : 'success'}`}>
                                        {dashboardResult.summary.harvest_level}
                                    </span>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className={`summary-icon logistics ${getStressColor(dashboardResult.summary.logistics_stress_level)}`}>
                                    <Truck size={24} />
                                </div>
                                <div className="summary-content">
                                    <div className="summary-value">
                                        {Math.round(dashboardResult.logistics_assessment.utilization_ratio * 100)}%
                                        <span className="summary-unit">utilization</span>
                                    </div>
                                    <div className="summary-label">Transport Capacity</div>
                                    <span className={`badge badge-${getStressColor(dashboardResult.summary.logistics_stress_level)}`}>
                                        {dashboardResult.summary.logistics_stress_level}
                                    </span>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className={`summary-icon storage ${getActionColor(dashboardResult.summary.storage_action)}`}>
                                    <Warehouse size={24} />
                                </div>
                                <div className="summary-content">
                                    <div className="summary-value">
                                        {dashboardResult.summary.storage_reserve_percentage}%
                                        <span className="summary-unit">reserve</span>
                                    </div>
                                    <div className="summary-label">Storage Recommendation</div>
                                    <span className={`badge badge-${getActionColor(dashboardResult.summary.storage_action)}`}>
                                        {dashboardResult.summary.storage_action?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Advisories */}
                        <div className="advisories-section">
                            <h3>
                                <Info size={20} />
                                System Advisories
                            </h3>
                            <div className="advisories-list">
                                {dashboardResult.advisories?.map((advisory, i) => (
                                    <div key={i} className="advisory">
                                        <CheckCircle size={18} className="advisory-icon" />
                                        <span>{advisory}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Farmer Forecasts */}
                        <div className="forecasts-section">
                            <h3>Individual Farmer Forecasts</h3>
                            <div className="forecasts-grid">
                                {dashboardResult.harvest_forecast?.individual_forecasts?.map((farmer) => (
                                    <div key={farmer.farmer_id} className="forecast-card card">
                                        <div className="forecast-header">
                                            <span className="farmer-name">{farmer.farmer_name}</span>
                                            <span className={`badge badge-${farmer.harvest_level === 'HIGH' ? 'error' : farmer.harvest_level === 'MEDIUM' ? 'warning' : 'success'}`}>
                                                {farmer.harvest_level}
                                            </span>
                                        </div>
                                        <div className="forecast-stats">
                                            <div className="forecast-stat">
                                                <span className="stat-value">{farmer.forecasted_harvest_volume}</span>
                                                <span className="stat-label">Tonnes</span>
                                            </div>
                                            <div className="forecast-stat">
                                                <span className="stat-value">{Math.round(farmer.confidence_score * 100)}%</span>
                                                <span className="stat-label">Confidence</span>
                                            </div>
                                            <div className="forecast-stat">
                                                <span className="stat-value">{farmer.days_to_harvest}</span>
                                                <span className="stat-label">Days to Harvest</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Storage Facilities */}
                        <div className="storage-section">
                            <h3>Storage Facilities</h3>
                            <div className="storage-grid">
                                {dashboardResult.storage_assessment?.facilities?.facilities?.map((facility) => (
                                    <div key={facility.storage_id} className="storage-card card">
                                        <h4>{facility.name}</h4>
                                        <div className="storage-bar">
                                            <div
                                                className="storage-fill"
                                                style={{ width: `${(facility.current_usage / facility.total_capacity) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="storage-info">
                                            <span>{facility.available} tonnes available</span>
                                            <span>{facility.temperature_range}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!dashboardResult && !uiStatus.loading && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <TrendingUp size={48} />
                        </div>
                        <h3>No Coordination Data</h3>
                        <p>Click "Run Coordination" to analyze harvest forecasts, logistics stress, and storage allocation.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard

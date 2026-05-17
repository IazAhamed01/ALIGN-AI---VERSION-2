import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Warehouse, Truck, ShoppingCart, BarChart3, Shield } from 'lucide-react'
import './Landing.css'

const features = [
    {
        icon: Leaf,
        title: 'Farmer Coordination',
        description: 'Collect harvest intent signals and readiness scores from farmers in your region.'
    },
    {
        icon: Warehouse,
        title: 'Storage Optimization',
        description: 'Real-time visibility into cold storage capacity and smart allocation recommendations.'
    },
    {
        icon: Truck,
        title: 'Logistics Intelligence',
        description: 'Detect transport bottlenecks before they occur with predictive stress analysis.'
    },
    {
        icon: ShoppingCart,
        title: 'Market Integration',
        description: 'ONDC-powered marketplace for seamless produce listing and price discovery.'
    }
]

const stats = [
    { value: '174+', label: 'Tonnes Forecasted' },
    { value: '3', label: 'Farmers Connected' },
    { value: '800', label: 'Tonnes Storage' },
    { value: '5', label: 'Day Forecast Window' }
]

function Landing() {
    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-container">
                    <div className="hero-badge animate-fadeIn">
                        <span className="badge-dot"></span>
                        Revolutionizing Agricultural Supply Chains
                    </div>

                    <h1 className="hero-title animate-fadeInUp">
                        <span className="text-emerald">ALIGN</span><br />
                        Agricultural Logistics Intelligence<br />
                        and Grid Network
                    </h1>

                    <p className="hero-description animate-fadeInUp">
                        ALIGN connects farmers, storage facilities, logistics providers,
                        and markets through intelligent coordination—creating a
                        seamless, efficient agricultural ecosystem.
                    </p>

                    <div className="hero-actions animate-fadeInUp">
                        <Link to="/dashboard" className="btn btn-primary btn-lg">
                            Explore Solutions <ArrowRight size={20} />
                        </Link>
                        <Link to="/farmers" className="btn btn-outline btn-lg">
                            Learn More
                        </Link>
                    </div>
                </div>

                <div className="hero-gradient"></div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Complete Coordination Platform</h2>
                        <p>Everything you need to optimize your agricultural supply chain</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="feature-card card animate-fadeInUp"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="feature-icon">
                                    <feature.icon size={24} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration Section */}
            <section className="integration-section">
                <div className="container">
                    <div className="integration-card">
                        <div className="integration-content">
                            <h2>Powered by India Stack</h2>
                            <p>
                                Seamlessly integrated with AgriStack, ULIP, and ONDC for
                                trusted data, logistics tracking, and open commerce.
                            </p>
                            <div className="integration-badges">
                                <div className="integration-badge">
                                    <Shield size={20} />
                                    AgriStack
                                </div>
                                <div className="integration-badge">
                                    <Truck size={20} />
                                    ULIP
                                </div>
                                <div className="integration-badge">
                                    <ShoppingCart size={20} />
                                    ONDC
                                </div>
                            </div>
                        </div>
                        <div className="integration-visual">
                            <BarChart3 size={120} strokeWidth={1} />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Ready to Optimize Your Supply Chain?</h2>
                        <p>Start coordinating your agricultural operations today</p>
                        <Link to="/dashboard" className="btn btn-secondary btn-lg">
                            Open Dashboard <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Landing

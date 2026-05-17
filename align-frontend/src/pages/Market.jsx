import { useState } from 'react'
import {
    ShoppingCart,
    MapPin,
    Calendar,
    Clock,
    TrendingUp,
    Package,
    ChevronDown,
    Grid3X3,
    List
} from 'lucide-react'
import './Market.css'

// Sample products data
const products = [
    {
        id: 1,
        name: 'Tomato Plant (Hybrid)',
        seller: 'Krishak Seeds',
        location: 'Pune, Maharashtra',
        price: '₹120',
        unit: 'per kg',
        rating: 4.5,
        minOrder: '100 kg',
        category: 'Seeds & Plants',
        image: '🍅'
    },
    {
        id: 2,
        name: 'Fresh Onion (Red)',
        seller: 'Nashik Farmers Collective',
        location: 'Nashik, Maharashtra',
        price: '₹28',
        unit: 'per kg',
        rating: 4.8,
        minOrder: '500 kg',
        category: 'Vegetables',
        image: '🧅'
    },
    {
        id: 3,
        name: 'Organic Fertilizer',
        seller: 'GreenGrow Agri',
        location: 'Bengaluru, Karnataka',
        price: '₹450',
        unit: 'per 50kg bag',
        rating: 4.2,
        minOrder: '10 bags',
        category: 'Fertilizers',
        image: '🌱'
    },
    {
        id: 4,
        name: 'Cold Storage Space',
        seller: 'Nashik Cold Hub',
        location: 'Sinnar, Maharashtra',
        price: '₹8',
        unit: 'per kg/month',
        rating: 4.6,
        minOrder: '1000 kg',
        category: 'Storage',
        image: '❄️'
    },
    {
        id: 5,
        name: 'Transport Service',
        seller: 'AgriMove Logistics',
        location: 'PAN India',
        price: '₹12',
        unit: 'per km/tonne',
        rating: 4.4,
        minOrder: '5 tonnes',
        category: 'Logistics',
        image: '🚚'
    },
    {
        id: 6,
        name: 'Fresh Tomatoes (Roma)',
        seller: 'Deola Farm Fresh',
        location: 'Nashik, Maharashtra',
        price: '₹35',
        unit: 'per kg',
        rating: 4.7,
        minOrder: '200 kg',
        category: 'Vegetables',
        image: '🍅'
    },
]

const categories = [
    'All Products',
    'Vegetables',
    'Seeds & Plants',
    'Fertilizers',
    'Storage',
    'Logistics'
]

const sortOptions = [
    'Most Relevant',
    'Price: Low to High',
    'Price: High to Low',
    'Rating',
    'Distance'
]

function Market() {
    const [activeCategory, setActiveCategory] = useState('All Products')
    const [viewMode, setViewMode] = useState('grid')
    const [sortBy, setSortBy] = useState('Most Relevant')

    const filteredProducts = activeCategory === 'All Products'
        ? products
        : products.filter(p => p.category === activeCategory)

    return (
        <div className="market page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-badges">
                        <img src="/assets/align-logo.jpg" alt="Align" className="logo-mini" />
                        <img src="/assets/ondc-logo.png" alt="ONDC" className="partner-logo" />
                    </div>
                    <h1>Agricultural Marketplace</h1>
                    <p className="text-muted">Open network for digital commerce</p>
                </div>

                {/* Search & Filters Bar */}
                <div className="market-controls">
                    <div className="category-nav">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="view-controls">
                        <div className="sort-dropdown">
                            <span>Sort by:</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                {sortOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} />
                        </div>

                        <div className="view-toggle">
                            <button
                                className={viewMode === 'grid' ? 'active' : ''}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3X3 size={18} />
                            </button>
                            <button
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="results-bar">
                    <span>{filteredProducts.length} products in {activeCategory}</span>
                </div>

                {/* Products Grid */}
                <div className={`products-${viewMode}`}>
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card card">
                            <div className="product-image">
                                <span className="product-emoji">{product.image}</span>
                            </div>

                            <div className="product-content">
                                <span className="product-category">{product.category}</span>
                                <h3>{product.name}</h3>

                                <div className="product-seller">
                                    <span className="seller-name">{product.seller}</span>
                                    <div className="seller-rating">
                                        ⭐ {product.rating}
                                    </div>
                                </div>

                                <div className="product-location">
                                    <MapPin size={14} />
                                    {product.location}
                                </div>

                                <div className="product-price">
                                    <span className="price">{product.price}</span>
                                    <span className="unit">{product.unit}</span>
                                </div>

                                <div className="product-meta">
                                    <span className="min-order">
                                        <Package size={14} />
                                        Min. {product.minOrder}
                                    </span>
                                </div>

                                <div className="product-actions">
                                    <button className="btn btn-outline">View Details</button>
                                    <button className="btn btn-primary">
                                        <ShoppingCart size={16} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Market Stats */}
                <div className="market-stats">
                    <div className="market-stat-card card">
                        <TrendingUp size={24} className="stat-icon" />
                        <div>
                            <div className="stat-value">1,847</div>
                            <div className="stat-label">Active Listings</div>
                        </div>
                    </div>
                    <div className="market-stat-card card">
                        <Package size={24} className="stat-icon" />
                        <div>
                            <div className="stat-value">₹2.3 Cr</div>
                            <div className="stat-label">Monthly GMV</div>
                        </div>
                    </div>
                    <div className="market-stat-card card">
                        <Clock size={24} className="stat-icon" />
                        <div>
                            <div className="stat-value">24 hrs</div>
                            <div className="stat-label">Avg. Fulfillment</div>
                        </div>
                    </div>
                    <div className="market-stat-card card">
                        <Calendar size={24} className="stat-icon" />
                        <div>
                            <div className="stat-value">156</div>
                            <div className="stat-label">Sellers Today</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Market

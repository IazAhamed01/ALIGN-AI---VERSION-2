import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Warehouse, Truck, ShoppingCart, Sparkles } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '../context/LanguageContext'
import './Navbar.css'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/farmers', label: 'Farmers', icon: Users },
    { path: '/storage', label: 'Storage', icon: Warehouse },
    { path: '/logistics', label: 'Logistics', icon: Truck },
    { path: '/market', label: 'Market', icon: ShoppingCart },
    { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
]

function Navbar() {
    const { language, changeLanguage } = useLanguage()

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo">
                    <img src="/assets/align-logo.jpg" alt="AlignAI" className="logo-image" />
                </Link>

                <div className="navbar-menu">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="navbar-actions">
                    <LanguageSwitcher
                        currentLanguage={language}
                        onLanguageChange={changeLanguage}
                    />
                    <Link to="/dashboard" className="btn btn-primary">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar

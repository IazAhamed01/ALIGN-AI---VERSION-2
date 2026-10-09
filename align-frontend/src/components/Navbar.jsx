import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Warehouse, Truck, ShoppingCart, Sparkles } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '../context/LanguageContext'
import './Navbar.css'

function Navbar() {
    const { language, changeLanguage, t } = useLanguage()

    const navItems = [
        { path: '/dashboard', label: t?.nav?.dashboard || 'Dashboard', icon: LayoutDashboard },
        { path: '/farmers', label: t?.nav?.farmers || 'Farmers', icon: Users },
        { path: '/storage', label: t?.nav?.storage || 'Storage', icon: Warehouse },
        { path: '/logistics', label: t?.nav?.logistics || 'Logistics', icon: Truck },
        { path: '/market', label: t?.nav?.market || 'Market', icon: ShoppingCart },
        { path: '/ai-assistant', label: t?.nav?.aiAssistant || 'AI Assistant', icon: Sparkles },
    ]

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
                        {t?.nav?.getStarted || 'Get Started'}
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar

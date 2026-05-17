import './Footer.css'

function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-brand">
                    <div className="logo-box">
                        <span className="logo-text">align</span>
                    </div>
                    <p className="footer-tagline">
                        Agricultural Logistics Intelligence and Grid Network
                    </p>
                </div>

                <div className="footer-links">
                    <div className="footer-section">
                        <h4>Platform</h4>
                        <a href="/dashboard">Dashboard</a>
                        <a href="/farmers">Farmers</a>
                        <a href="/storage">Storage</a>
                    </div>
                    <div className="footer-section">
                        <h4>Integrations</h4>
                        <span className="partner-badge">AgriStack</span>
                        <span className="partner-badge">ULIP</span>
                        <span className="partner-badge">ONDC</span>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 ALIGN. Built for Hackathon.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer

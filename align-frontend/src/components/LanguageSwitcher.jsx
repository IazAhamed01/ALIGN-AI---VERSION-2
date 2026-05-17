import { useState } from 'react'
import { Globe } from 'lucide-react'
import './LanguageSwitcher.css'

const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
]

function LanguageSwitcher({ currentLanguage = 'en', onLanguageChange }) {
    const [isOpen, setIsOpen] = useState(false)

    const handleLanguageSelect = (langCode) => {
        if (onLanguageChange) {
            onLanguageChange(langCode)
        }
        setIsOpen(false)

        // Store in localStorage
        localStorage.setItem('preferredLanguage', langCode)
    }

    const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

    return (
        <div className="language-switcher">
            <button
                className="language-button"
                onClick={() => setIsOpen(!isOpen)}
                title="Change Language"
            >
                <Globe size={18} />
                <span className="current-lang">{currentLang.nativeName}</span>
            </button>

            {isOpen && (
                <>
                    <div className="language-overlay" onClick={() => setIsOpen(false)} />
                    <div className="language-dropdown">
                        <div className="dropdown-header">
                            <Globe size={16} />
                            <span>Select Language</span>
                        </div>
                        <div className="language-list">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    className={`language-option ${lang.code === currentLanguage ? 'active' : ''}`}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                >
                                    <span className="lang-native">{lang.nativeName}</span>
                                    <span className="lang-english">{lang.name}</span>
                                    {lang.code === currentLanguage && (
                                        <span className="checkmark">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default LanguageSwitcher

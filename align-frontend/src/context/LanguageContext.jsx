import { createContext, useContext, useState, useMemo } from 'react'
import { getTranslation } from './translations'

const LanguageContext = createContext()

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Get from localStorage or default to English
        return localStorage.getItem('preferredLanguage') || 'en'
    })

    const changeLanguage = (newLanguage) => {
        setLanguage(newLanguage)
        localStorage.setItem('preferredLanguage', newLanguage)
    }

    const t = useMemo(() => getTranslation(language), [language])

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

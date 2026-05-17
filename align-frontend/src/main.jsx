import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GlobalStateProvider } from './context/GlobalState'
import { LanguageProvider } from './context/LanguageContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <GlobalStateProvider>
          <App />
        </GlobalStateProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)

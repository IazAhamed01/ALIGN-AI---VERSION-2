import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Farmers from './pages/Farmers'
import Storage from './pages/Storage'
import Logistics from './pages/Logistics'
import Market from './pages/Market'
import AIAssistant from './pages/AIAssistant'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/market" element={<Market />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

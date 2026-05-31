import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import StatsPage from './pages/StatsPage'
import VisualsPage from './pages/VisualsPage'

function App() {
    return (
        <Router>
            <Navbar />
            <div style={{ paddingTop: '60px' }}>
                <Routes>
                    <Route path="/" element={<StatsPage />} />
                    <Route path="/visuals" element={<VisualsPage />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
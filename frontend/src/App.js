import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import StatsPage from './pages/StatsPage'
import VisualsPage from './pages/VisualsPage'

function App() {
    return (
        <Router>
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div style={{ flex: 1, marginLeft: '80px' }}>
                    <Routes>
                        <Route path="/" element={<StatsPage />} />
                        <Route path="/visuals" element={<VisualsPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    )
}

export default App
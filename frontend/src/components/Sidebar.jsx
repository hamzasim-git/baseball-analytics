import { useNavigate, useLocation } from 'react-router-dom'

function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div style={{
            width: '80px',
            height: '100vh',
            backgroundColor: '#161b22',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20px',
            gap: '30px',
            position: 'fixed',
            borderRight: '1px solid #30363d'
        }}>
            <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '24px' }}>⚾</span>
            </div>

            <div
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: location.pathname === '/' ? '#00d4aa' : '#8b949e',
                    gap: '4px'
                }}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <span style={{ fontSize: '10px' }}>STATS</span>
            </div>

            <div
                onClick={() => navigate('/visuals')}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: location.pathname === '/visuals' ? '#00d4aa' : '#8b949e',
                    gap: '4px'
                }}>
                <span style={{ fontSize: '20px' }}>🎯</span>
                <span style={{ fontSize: '10px' }}>VISUALS</span>
            </div>
        </div>
    )
}

export default Sidebar
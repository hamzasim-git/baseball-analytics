import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') !== 'false'
    })

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode)
        document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    }, [darkMode])

    const navLinks = [
        { label: 'STATS', path: '/' },
        { label: 'VISUALS', path: '/visuals' }
    ]

    return (
        <nav style={{
            width: '100%',
            height: '60px',
            backgroundColor: darkMode ? '#001A57' : '#003DA5',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            alignItems: 'center',
            padding: '0 30px',
            position: 'fixed',
            top: 0,
            zIndex: 1000,
            borderBottom: '2px solid #E8291C'
        }}>

            {/* Logo */}
            <div
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                }}>
                <span style={{ fontSize: '26px' }}>⚾</span>
                <div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: '#ffffff',
                        letterSpacing: '0.05em',
                        lineHeight: 1
                    }}>
                        BOX<span style={{ color: '#E8291C' }}>SCORE</span>
                    </div>
                    <div style={{
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.15em'
                    }}>
                        MLB ANALYTICS
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                {navLinks.map(link => (
                    <div
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        style={{
                            color: location.pathname === link.path ? '#E8291C' : '#ffffff',
                            fontWeight: location.pathname === link.path ? '700' : '500',
                            fontSize: '13px',
                            letterSpacing: '0.12em',
                            cursor: 'pointer',
                            borderBottom: location.pathname === link.path ? '2px solid #E8291C' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'color 0.15s'
                        }}>
                        {link.label}
                    </div>
                ))}
            </div>

            {/* Dark/light toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div
                    onClick={() => setDarkMode(!darkMode)}
                    style={{
                        width: '50px',
                        height: '26px',
                        backgroundColor: darkMode ? '#E8291C' : '#ffffff',
                        borderRadius: '13px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: darkMode ? '#ffffff' : '#003DA5',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: darkMode ? '27px' : '3px',
                        transition: 'left 0.2s'
                    }} />
                    <span style={{
                        position: 'absolute',
                        fontSize: '11px',
                        top: '5px',
                        left: darkMode ? '6px' : '26px',
                        color: darkMode ? '#ffffff' : '#003DA5'
                    }}>
                        {darkMode ? '🌙' : '☀️'}
                    </span>
                </div>
            </div>

        </nav>
    )
}

export default Navbar
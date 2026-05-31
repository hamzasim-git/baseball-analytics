import { useState, useEffect } from 'react'
import { searchPlayers, getHits, getPlayerGames, getHeatmap, getPitcherGames } from '../api'
import SprayChart from '../components/SprayChart'
import PitchHeatmap from '../components/PitchHeatmap'

function VisualsPage() {
    const [searchName, setSearchName] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedPlayer, setSelectedPlayer] = useState(null)
    const [mode, setMode] = useState('batter')
    const [selectedYear, setSelectedYear] = useState('')
    const [games, setGames] = useState([])
    const [selectedGame, setSelectedGame] = useState('all')
    const [visualData, setVisualData] = useState([])
    const [loading, setLoading] = useState(false)
    const [darkMode, setDarkMode] = useState(
        document.body.getAttribute('data-theme') === 'dark'
    )

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDarkMode(document.body.getAttribute('data-theme') === 'dark')
        })
        observer.observe(document.body, { attributes: true })
        return () => observer.disconnect()
    }, [])

    const years = Array.from({ length: 12 }, (_, i) => 2015 + i)

    const bg = darkMode ? '#0a0f1e' : '#f4f6f9'
    const cardBg = darkMode ? '#0f1729' : '#ffffff'
    const border = darkMode ? '#1e2d4a' : '#dde3ed'
    const text = darkMode ? '#ffffff' : '#0a1628'
    const subtext = darkMode ? '#7a8fa6' : '#5a6a7e'
    const inputBg = darkMode ? '#0f1729' : '#ffffff'

    const handleSearch = () => {
        if (searchName.length < 2) return
        searchPlayers(searchName).then(res => setSearchResults(res.data))
    }

    const handlePlayerSelect = (player) => {
        setSelectedPlayer(player)
        setSearchResults([])
        setSearchName(`${player.first_name} ${player.last_name}`)
        setGames([])
        setVisualData([])
        setSelectedYear('')
    }

    const handleYearChange = (year) => {
        setSelectedYear(parseInt(year))
        setSelectedGame('all')
        setVisualData([])
        if (selectedPlayer && year) {
            if (mode === 'batter') {
                getPlayerGames(selectedPlayer.player_id, parseInt(year)).then(res => setGames(res.data))
            } else {
                getPitcherGames(selectedPlayer.player_id, parseInt(year)).then(res => setGames(res.data))
            }
        }
    }

    const handleLoad = () => {
        if (!selectedPlayer || !selectedYear) return
        const gameId = selectedGame === 'all' ? null : selectedGame
        setLoading(true)
        setVisualData([])
        if (mode === 'batter') {
            getHits(selectedPlayer.player_id, selectedYear, gameId)
                .then(res => setVisualData(res.data))
                .finally(() => setLoading(false))
        } else {
            getHeatmap(selectedPlayer.player_id, selectedYear, gameId)
                .then(res => setVisualData(res.data))
                .finally(() => setLoading(false))
        }
    }

    return (
        <div style={{ backgroundColor: bg, minHeight: '100vh' }}>

            {/* Controls bar */}
            <div style={{
                padding: '20px 40px',
                borderBottom: `1px solid ${border}`,
                backgroundColor: darkMode ? '#0d1526' : '#ffffff'
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.15em',
                        color: subtext
                    }}>
                        PLAYER VISUALS
                    </span>
                    <div style={{ width: '40px', height: '3px', backgroundColor: '#E8291C', borderRadius: '2px', marginTop: '4px' }} />
                </div>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {['batter', 'pitcher'].map(m => (
                        <button
                            key={m}
                            onClick={() => {
                                setMode(m)
                                setVisualData([])
                                setGames([])
                            }}
                            style={{
                                padding: '7px 18px',
                                borderRadius: '6px',
                                border: `1px solid ${mode === m ? '#003DA5' : border}`,
                                backgroundColor: mode === m ? '#003DA5' : inputBg,
                                color: mode === m ? '#ffffff' : subtext,
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '12px',
                                letterSpacing: '0.08em'
                            }}>
                            {m.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Controls row */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>

                    {/* Player search */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                placeholder="Search player..."
                                style={{
                                    backgroundColor: inputBg,
                                    color: text,
                                    border: `1px solid ${border}`,
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    width: '200px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSearch}
                                style={{
                                    padding: '8px 14px',
                                    backgroundColor: inputBg,
                                    color: '#003DA5',
                                    border: `1px solid ${border}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '12px'
                                }}>
                                SEARCH
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '42px',
                                left: '0',
                                backgroundColor: cardBg,
                                border: `1px solid ${border}`,
                                borderRadius: '8px',
                                zIndex: 100,
                                width: '220px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                            }}>
                                {searchResults.map(p => (
                                    <div
                                        key={p.player_id}
                                        onClick={() => handlePlayerSelect(p)}
                                        style={{
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            borderBottom: `1px solid ${border}`,
                                            fontSize: '13px',
                                            color: text
                                        }}>
                                        {p.first_name} {p.last_name}
                                        <span style={{ fontSize: '11px', color: subtext, marginLeft: '6px' }}>
                                            {p.debut_date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year dropdown */}
                    <select
                        value={selectedYear}
                        onChange={e => handleYearChange(e.target.value)}
                        style={{
                            backgroundColor: inputBg,
                            color: text,
                            border: `1px solid ${border}`,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                        }}>
                        <option value="">Season...</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    {/* Game dropdown */}
                    <select
                        value={selectedGame}
                        onChange={e => setSelectedGame(e.target.value)}
                        style={{
                            backgroundColor: inputBg,
                            color: text,
                            border: `1px solid ${border}`,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            maxWidth: '220px'
                        }}>
                        <option value="all">All Games</option>
                        {games.map(g => (
                            <option key={g.game_id} value={g.game_id}>
                                {g.date} — {g.away_team} @ {g.home_team}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleLoad}
                        style={{
                            padding: '8px 22px',
                            backgroundColor: '#E8291C',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '13px',
                            letterSpacing: '0.08em'
                        }}>
                        LOAD
                    </button>

                    {selectedPlayer && (
                        <div style={{
                            padding: '8px 14px',
                            backgroundColor: '#003DA5',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#ffffff'
                        }}>
                            {selectedPlayer.first_name} {selectedPlayer.last_name}
                            {selectedYear && <span style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '8px' }}>{selectedYear}</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* Visual area */}
            <div style={{ padding: '30px 40px' }}>

                {loading && (
                    <div style={{
                        color: subtext,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div style={{
                            width: '16px',
                            height: '16px',
                            border: `2px solid ${border}`,
                            borderTop: '2px solid #E8291C',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                        Loading data...
                    </div>
                )}

                {!loading && visualData.length > 0 && (
                    <div>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '0.12em',
                            color: subtext,
                            marginBottom: '20px'
                        }}>
                            {mode === 'batter'
                                ? `SPRAY CHART — ${visualData.length} BATTED BALLS`
                                : `PITCH HEATMAP — ${visualData.length} PITCHES`
                            }
                        </div>
                        {mode === 'batter'
                            ? <SprayChart data={visualData} darkMode={darkMode} />
                            : <PitchHeatmap data={visualData} darkMode={darkMode} />
                        }
                    </div>
                )}

                {!loading && visualData.length === 0 && selectedPlayer && selectedYear && (
                    <div style={{
                        color: subtext,
                        fontSize: '14px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: cardBg,
                        borderRadius: '12px',
                        border: `1px solid ${border}`
                    }}>
                        No data found for this selection. Try a different year or game.
                    </div>
                )}

                {!selectedPlayer && (
                    <div style={{
                        color: subtext,
                        fontSize: '14px',
                        padding: '60px 20px',
                        textAlign: 'center'
                    }}>
                        Search for a player to get started
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default VisualsPage
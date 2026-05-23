import { useState } from 'react'
import { searchPlayers, getHomeruns, getPlayerGames, getHeatmap, getPitcherGames } from '../api'
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

    const years = Array.from({ length: 11 }, (_, i) => 2015 + i)

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
        console.log('Load clicked', selectedPlayer, selectedYear, selectedGame)
        if (!selectedPlayer || !selectedYear) return
        const gameId = selectedGame === 'all' ? null : selectedGame
        if (mode === 'batter') {
            getHomeruns(selectedPlayer.player_id, selectedYear, gameId).then(res => setVisualData(res.data))
        } else {
            getHeatmap(selectedPlayer.player_id, selectedYear, gameId).then(res => setVisualData(res.data))
        }
    }

    return (
        <div style={{ padding: '30px' }}>
            <h1 style={{ color: '#00d4aa', marginBottom: '20px' }}>
                BASEBALL ANALYTICS — VISUALS
            </h1>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['batter', 'pitcher'].map(m => (
                    <button
                        key={m}
                        onClick={() => { setMode(m); setVisualData([]); setGames([]) }}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '6px',
                            border: '1px solid #30363d',
                            backgroundColor: mode === m ? '#00d4aa' : '#161b22',
                            color: mode === m ? '#000' : '#8b949e',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px'
                        }}>
                        {m.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {/* Player search */}
                <div style={{ position: 'relative' }}>
                    <input
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search player..."
                        style={{
                            backgroundColor: '#161b22',
                            color: '#fff',
                            border: '1px solid #30363d',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            width: '220px'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            marginLeft: '6px',
                            padding: '10px 16px',
                            backgroundColor: '#161b22',
                            color: '#00d4aa',
                            border: '1px solid #30363d',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}>
                        Search
                    </button>
                    {searchResults.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '45px',
                            left: '0',
                            backgroundColor: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: '6px',
                            zIndex: 100,
                            width: '220px'
                        }}>
                            {searchResults.map(p => (
                                <div
                                    key={p.player_id}
                                    onClick={() => handlePlayerSelect(p)}
                                    style={{
                                        padding: '10px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #21262d',
                                        fontSize: '13px'
                                    }}>
                                    {p.first_name} {p.last_name}
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
                        backgroundColor: '#161b22',
                        color: '#fff',
                        border: '1px solid #30363d',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}>
                    <option value="">Select year...</option>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                {/* Game dropdown */}
                <select
                    value={selectedGame}
                    onChange={e => setSelectedGame(e.target.value)}
                    style={{
                        backgroundColor: '#161b22',
                        color: '#fff',
                        border: '1px solid #30363d',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '14px'
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
                        padding: '10px 20px',
                        backgroundColor: '#00d4aa',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}>
                    LOAD
                </button>
            </div>

            {/* Results count */}
            {visualData.length > 0 && (
                <p style={{ color: '#8b949e', fontSize: '13px', marginBottom: '16px' }}>
                    {visualData.length} {mode === 'batter' ? 'home runs' : 'pitches'} loaded
                </p>
            )}
            {visualData.length > 0 && (
    <div>
        {mode === 'batter' 
            ? <SprayChart data={visualData} />
            : <PitchHeatmap data={visualData} />
        }
    </div>
)}

        {visualData.length === 0 && selectedPlayer && selectedYear && (
            <div style={{ 
                color: '#8b949e', 
                fontSize: '14px', 
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#161b22',
                borderRadius: '8px',
                border: '1px solid #30363d'
            }}>
                No {mode === 'batter' ? 'home runs' : 'pitches'} found for this selection.
                {mode === 'batter' && ' Try selecting "All Games" or a different year.'}
            </div>
        )}
        </div>
    )
}

export default VisualsPage
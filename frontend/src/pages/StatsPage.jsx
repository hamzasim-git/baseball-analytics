import { useState, useEffect } from 'react'
import { getTeams, getTeamSeasons, getTeamSeason, getTeamGames } from '../api'

function StatsPage() {
    const [teams, setTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [seasons, setSeasons] = useState([])
    const [selectedYear, setSelectedYear] = useState(null)
    const [seasonStats, setSeasonStats] = useState(null)
    const [games, setGames] = useState([])

    // Load all teams on page load
    useEffect(() => {
        getTeams().then(res => setTeams(res.data))
    }, [])

    // Load seasons when team is selected
    useEffect(() => {
        if (selectedTeam) {
            getTeamSeasons(selectedTeam.team_id).then(res => setSeasons(res.data))
            setSelectedYear(null)
            setSeasonStats(null)
            setGames([])
        }
    }, [selectedTeam])

    // Load season stats and games when year is selected
    useEffect(() => {
        if (selectedTeam && selectedYear) {
            getTeamSeason(selectedTeam.team_id, selectedYear).then(res => setSeasonStats(res.data))
            getTeamGames(selectedTeam.team_id, selectedYear).then(res => setGames(res.data))
        }
    }, [selectedYear])

    return (
        <div style={{ padding: '30px' }}>
            <h1 style={{ color: '#00d4aa', marginBottom: '20px' }}>
                BASEBALL ANALYTICS — STATS DASHBOARD
            </h1>

            {/* Team selector */}
            <div style={{ marginBottom: '20px' }}>
                <select
                    onChange={e => {
                        const team = teams.find(t => t.team_id === parseInt(e.target.value))
                        setSelectedTeam(team)
                    }}
                    style={{
                        backgroundColor: '#161b22',
                        color: '#fff',
                        border: '1px solid #30363d',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        width: '300px'
                    }}>
                    <option value="">Select a team...</option>
                    {teams.map(team => (
                        <option key={team.team_id} value={team.team_id}>
                            {team.name}
                        </option>
                    ))}
                </select>

                {seasons.length > 0 && (
                    <select
                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                        style={{
                            backgroundColor: '#161b22',
                            color: '#fff',
                            border: '1px solid #30363d',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            width: '150px',
                            marginLeft: '10px'
                        }}>
                        <option value="">Select year...</option>
                        {seasons.map(s => (
                            <option key={s.year} value={s.year}>{s.year}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Season stats cards */}
            {seasonStats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
                    <StatCard label="RECORD" value={`${seasonStats.wins}-${seasonStats.losses}`} />
                    <StatCard label="DIVISION RANK" value={`${seasonStats.division_rank}st`} />
                    <StatCard label="RUN DIFF" value={seasonStats.run_differential > 0 ? `+${seasonStats.run_differential}` : seasonStats.run_differential} />
                    <StatCard label="PLAYOFF RESULT" value={seasonStats.playoff_result?.toUpperCase()} />
                    <StatCard label="TEAM ERA" value={seasonStats.team_era} />
                    <StatCard label="TEAM OPS" value={seasonStats.team_ops} />
                    <StatCard label="RUNS SCORED" value={seasonStats.runs_scored} />
                    <StatCard label="RUNS ALLOWED" value={seasonStats.runs_allowed} />
                </div>
            )}

            {/* Games table */}
            {games.length > 0 && (
                <div>
                    <h2 style={{ color: '#8b949e', marginBottom: '16px', fontSize: '14px' }}>
                        GAME RESULTS — {selectedYear}
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #30363d' }}>
                                {['DATE', 'HOME', 'AWAY', 'SCORE', 'RESULT'].map(h => (
                                    <th key={h} style={{ padding: '10px', textAlign: 'left', color: '#8b949e', fontSize: '12px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {games.map(game => (
                                <tr key={game.game_id} style={{ borderBottom: '1px solid #21262d' }}>
                                    <td style={{ padding: '10px', fontSize: '13px' }}>{game.date}</td>
                                    <td style={{ padding: '10px', fontSize: '13px' }}>{game.home_team}</td>
                                    <td style={{ padding: '10px', fontSize: '13px' }}>{game.away_team}</td>
                                    <td style={{ padding: '10px', fontSize: '13px' }}>{game.home_score} - {game.away_score}</td>
                                    <td style={{ padding: '10px', fontSize: '13px', color: game.result === 'W' ? '#00d4aa' : '#f85149' }}>{game.result}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function StatCard({ label, value }) {
    return (
        <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '16px'
        }}>
            <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: '600', color: '#ffffff' }}>{value}</div>
        </div>
    )
}

export default StatsPage
import { useState, useEffect } from 'react'
import { getTeams, getTeamSeasons, getTeamSeason, getTeamGames } from '../api'

const DIVISIONS = {
    'AL East': ['TOR', 'NYY', 'BOS', 'BAL', 'TB'],
    'AL Central': ['CWS', 'CLE', 'DET', 'KC', 'MIN'],
    'AL West': ['HOU', 'LAA', 'ATH', 'SEA', 'TEX'],
    'NL East': ['ATL', 'MIA', 'NYM', 'PHI', 'WSH'],
    'NL Central': ['CHC', 'CIN', 'MIL', 'PIT', 'STL'],
    'NL West': ['AZ', 'COL', 'LAD', 'SD', 'SF'],
}

const TEAM_COLORS = {
    TOR: '#003DA5', NYY: '#003087', BOS: '#BD3039', BAL: '#DF4601', TB: '#092C5C',
    CWS: '#27251F', CLE: '#00385D', DET: '#0C2340', KC: '#004687', MIN: '#002B5C',
    HOU: '#002D62', LAA: '#BA0021', ATH: '#003831', SEA: '#0C2C56', TEX: '#003278',
    ATL: '#CE1141', MIA: '#00A3E0', NYM: '#002D72', PHI: '#E81828', WSH: '#AB0003',
    CHC: '#0E3386', CIN: '#C6011F', MIL: '#12284B', PIT: '#27251F', STL: '#C41E3A',
    AZ: '#A71930', COL: '#33006F', LAD: '#005A9C', SD: '#2F241D', SF: '#FD5A1E',
}

function StatsPage() {
    const [teams, setTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [seasons, setSeasons] = useState([])
    const [selectedYear, setSelectedYear] = useState(null)
    const [seasonStats, setSeasonStats] = useState(null)
    const [games, setGames] = useState([])
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

    useEffect(() => {
        getTeams().then(res => setTeams(res.data))
    }, [])

    useEffect(() => {
        if (selectedTeam) {
            getTeamSeasons(selectedTeam.team_id).then(res => setSeasons(res.data))
            setSelectedYear(null)
            setSeasonStats(null)
            setGames([])
        } else {
            setSeasons([])
            setSelectedYear(null)
            setSeasonStats(null)
            setGames([])
        }
    }, [selectedTeam])

    useEffect(() => {
        if (selectedTeam && selectedYear) {
            getTeamSeason(selectedTeam.team_id, selectedYear).then(res => setSeasonStats(res.data))
            getTeamGames(selectedTeam.team_id, selectedYear).then(res => setGames(res.data))
        }
    }, [selectedYear])

    const bg = darkMode ? '#0a0f1e' : '#f4f6f9'
    const cardBg = darkMode ? '#0f1729' : '#ffffff'
    const border = darkMode ? '#1e2d4a' : '#dde3ed'
    const text = darkMode ? '#ffffff' : '#0a1628'
    const subtext = darkMode ? '#7a8fa6' : '#5a6a7e'
    const inputBg = darkMode ? '#0f1729' : '#ffffff'

    return (
        <div style={{ backgroundColor: bg, minHeight: '100vh' }}>

            {/* Team selector section */}
            <div style={{
                padding: '24px 40px',
                borderBottom: `1px solid ${border}`,
                backgroundColor: darkMode ? '#0d1526' : '#ffffff'
            }}>
                {/* Dropdown */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em', color: subtext }}>
                        SELECT TEAM
                    </div>
                    <select
                        value={selectedTeam?.team_id || ''}
                        onChange={e => {
                            const team = teams.find(t => t.team_id === parseInt(e.target.value))
                            setSelectedTeam(team || null)
                        }}
                        style={{
                            backgroundColor: inputBg,
                            color: text,
                            border: `1px solid ${border}`,
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            outline: 'none',
                            minWidth: '240px'
                        }}>
                        <option value="">All Teams</option>
                        {teams.map(team => (
                            <option key={team.team_id} value={team.team_id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                    {selectedTeam && (
                        <div
                            onClick={() => setSelectedTeam(null)}
                            style={{
                                fontSize: '13px',
                                color: subtext,
                                cursor: 'pointer',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: `1px solid ${border}`
                            }}>
                            ✕ Clear
                        </div>
                    )}
                </div>

                {/* Logo strip */}
                <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                paddingTop: '8px',
                alignItems: 'flex-end',
                scrollbarWidth: 'none'
                }}>
                    {teams.map(team => {
                        const isSelected = selectedTeam?.team_id === team.team_id
                        const color = TEAM_COLORS[team.abbreviation] || '#003DA5'
                        return (
                            <TeamBadge
                                key={team.team_id}
                                team={team}
                                isSelected={isSelected}
                                color={color}
                                onClick={() => setSelectedTeam(isSelected ? null : team)}
                                darkMode={darkMode}
                                border={border}
                            />
                        )
                    })}
                </div>
            </div>

            {/* Main content */}
            <div style={{ padding: '30px 40px' }}>

                {/* Season selector */}
                {seasons.length > 0 && (
                    <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', color: subtext }}>
                            SELECT SEASON
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {seasons.map(s => (
                                <div
                                    key={s.year}
                                    onClick={() => setSelectedYear(s.year)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: selectedYear === s.year ? '700' : '500',
                                        backgroundColor: selectedYear === s.year ? '#E8291C' : darkMode ? '#0f1729' : '#ffffff',
                                        color: selectedYear === s.year ? '#ffffff' : darkMode ? '#7a8fa6' : '#5a6a7e',
                                        border: `1px solid ${selectedYear === s.year ? '#E8291C' : border}`,
                                        transition: 'all 0.15s ease'
                                    }}>
                                    {s.year}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Season stats cards */}
                {seasonStats && (
                    <>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '0.12em',
                            color: subtext,
                            marginBottom: '12px'
                        }}>
                            SEASON PERFORMANCE — {selectedYear}
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '12px',
                            marginBottom: '32px'
                        }}>
                            <StatCard label="RECORD" value={`${seasonStats.wins}-${seasonStats.losses}`} accent="#003DA5" cardBg={cardBg} border={border} text={text} subtext={subtext} />
                            <StatCard label="DIVISION RANK" value={`#${seasonStats.division_rank}`} cardBg={cardBg} border={border} text={text} subtext={subtext} />
                            <StatCard label="RUN DIFF" value={seasonStats.run_differential > 0 ? `+${seasonStats.run_differential}` : seasonStats.run_differential} accent={seasonStats.run_differential > 0 ? '#003DA5' : '#E8291C'} cardBg={cardBg} border={border} text={text} subtext={subtext} />
                            <StatCard label="PLAYOFF RESULT" value={seasonStats.playoff_result?.toUpperCase()} cardBg={cardBg} border={border} text={text} subtext={subtext} />
                            <StatCard label="TEAM ERA" value={seasonStats.team_era} cardBg={cardBg} border={border} text={text} subtext={subtext} />
                            <StatCard label="TEAM OPS" value={seasonStats.team_ops} cardBg={cardBg} border={border} text={text} subtext={subtext} />
                            <StatCard label="RUNS SCORED" value={seasonStats.runs_scored} cardBg={cardBg} border={border} text={text} subtext={subtext} />
                            <StatCard label="RUNS ALLOWED" value={seasonStats.runs_allowed} cardBg={cardBg} border={border} text={text} subtext={subtext} />
                        </div>
                    </>
                )}

                {/* Games table */}
                {games.length > 0 && (
                    <div style={{
                        backgroundColor: cardBg,
                        border: `1px solid ${border}`,
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: `1px solid ${border}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', color: subtext }}>
                                GAME RESULTS — {selectedYear}
                            </span>
                            <span style={{ fontSize: '11px', color: subtext }}>
                                {games.length} games
                            </span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${border}` }}>
                                    {['DATE', 'MATCHUP', 'SCORE', 'RESULT'].map(h => (
                                        <th key={h} style={{
                                            padding: '12px 20px',
                                            textAlign: 'left',
                                            color: subtext,
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            letterSpacing: '0.08em'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {games.map((game, i) => (
                                    <tr key={game.game_id} style={{
                                        borderBottom: `1px solid ${border}`,
                                        backgroundColor: i % 2 === 0 ? 'transparent' : darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                                    }}>
                                        <td style={{ padding: '12px 20px', fontSize: '13px', color: subtext }}>{game.date}</td>
                                        <td style={{ padding: '12px 20px', fontSize: '13px', color: text, fontWeight: '500' }}>
                                            {game.away_team} <span style={{ color: subtext }}>@</span> {game.home_team}
                                        </td>
                                        <td style={{ padding: '12px 20px', fontSize: '13px', color: text }}>
                                            {game.away_score} — {game.home_score}
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                padding: '3px 10px',
                                                borderRadius: '4px',
                                                backgroundColor: game.result === 'W' ? 'rgba(0,61,165,0.15)' : 'rgba(232,41,28,0.15)',
                                                color: game.result === 'W' ? '#003DA5' : '#E8291C'
                                            }}>
                                                {game.result}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, accent, cardBg, border, text, subtext }) {
    return (
        <div style={{
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            borderRadius: '10px',
            padding: '18px',
            borderTop: accent ? `3px solid ${accent}` : `3px solid transparent`
        }}>
            <div style={{
                fontSize: '10px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                color: subtext,
                marginBottom: '10px'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: text,
                lineHeight: 1
            }}>
                {value}
            </div>
        </div>
    )
}

function TeamBadge({ team, isSelected, color, onClick, darkMode, border }) {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                minWidth: isSelected ? '70px' : '58px',
                padding: isSelected ? '12px 16px' : '8px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: isSelected ? '14px' : '12px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                transform: hovered || isSelected ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered || isSelected ? `0 8px 20px ${color}66` : 'none',
                backgroundColor: isSelected ? color : hovered ? `${color}22` : darkMode ? '#0f1729' : '#ffffff',
                color: isSelected ? '#ffffff' : hovered ? color : darkMode ? '#7a8fa6' : '#5a6a7e',
                border: `1px solid ${isSelected ? color : hovered ? color : border}`,
                flexShrink: 0
            }}>
            {team.abbreviation}
        </div>
    )
}

export default StatsPage
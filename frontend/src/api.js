import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:8000'
})

export const getTeams = () => API.get('/teams')
export const getTeamSeasons = (teamId) => API.get(`/teams/${teamId}/seasons`)
export const getTeamSeason = (teamId, year) => API.get(`/teams/${teamId}/seasons/${year}`)
export const getTeamGames = (teamId, year) => API.get(`/games/${teamId}/${year}`)
export const searchPlayers = (name) => API.get(`/players/search?name=${name}`)
export const getHits = (playerId, year, gameId = null) => {
    const params = gameId ? `?year=${year}&game_id=${gameId}` : `?year=${year}`
    return API.get(`/players/${playerId}/hits${params}`)
}
export const getPlayerGames = (playerId, year) => API.get(`/players/${playerId}/games?year=${year}`)
export const getHeatmap = (playerId, year, gameId = null) => {
    const params = gameId ? `?year=${year}&game_id=${gameId}` : `?year=${year}`
    return API.get(`/pitchers/${playerId}/heatmap${params}`)
}
export const getPitcherGames = (playerId, year) => API.get(`/pitchers/${playerId}/games?year=${year}`)
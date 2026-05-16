from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Allow React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    return conn

@app.get("/")
def root():
    return {"message": "Baseball Analytics API"}

@app.get("/teams")
def get_teams():
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("SELECT * FROM Team ORDER BY league, division, name")
    teams = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return list(teams)

@app.get("/players/search")
def search_players(name: str):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("""
        SELECT player_id, first_name, last_name, debut_date
        FROM Player
        WHERE LOWER(first_name || ' ' || last_name) LIKE LOWER(%s)
        ORDER BY last_name
        LIMIT 20
    """, (f"%{name}%",))
    
    players = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return list(players)


@app.get("/players/{player_id}/homeruns")
def get_homeruns(player_id: int, year: int, game_id: str = None):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    if game_id:
        cursor.execute("""
            SELECT h.hit_id, h.coord_x, h.coord_y, h.exit_velocity,
                   h.launch_angle, h.distance_ft, g.date,
                   t.abbreviation as opponent
            FROM HitEvent h
            JOIN Game g ON h.game_id = g.game_id
            JOIN Team t ON (
                CASE WHEN g.home_team_id != (
                    SELECT team_id FROM Team WHERE abbreviation = (
                        SELECT home_team FROM Team LIMIT 1
                    )
                ) THEN g.home_team_id ELSE g.away_team_id END
            ) = t.team_id
            JOIN Season s ON g.season_id = s.season_id
            WHERE h.batter_id = %s
            AND h.hit_type = 'home_run'
            AND s.year = %s
            AND h.game_id = %s
        """, (player_id, year, game_id))
    else:
        cursor.execute("""
            SELECT h.hit_id, h.coord_x, h.coord_y, h.exit_velocity,
                   h.launch_angle, h.distance_ft, g.date, g.game_id
            FROM HitEvent h
            JOIN Game g ON h.game_id = g.game_id
            JOIN Season s ON g.season_id = s.season_id
            WHERE h.batter_id = %s
            AND h.hit_type = 'home_run'
            AND s.year = %s
            ORDER BY g.date
        """, (player_id, year))
    
    homeruns = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return list(homeruns)


@app.get("/players/{player_id}/games")
def get_player_games(player_id: int, year: int):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("""
        SELECT DISTINCT g.game_id, g.date,
               ht.abbreviation as home_team,
               at.abbreviation as away_team
        FROM Game g
        JOIN HitEvent h ON h.game_id = g.game_id
        JOIN Season s ON g.season_id = s.season_id
        JOIN Team ht ON g.home_team_id = ht.team_id
        JOIN Team at ON g.away_team_id = at.team_id
        WHERE h.batter_id = %s
        AND s.year = %s
        ORDER BY g.date
    """, (player_id, year))
    
    games = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return list(games)

@app.get("/pitchers/{player_id}/heatmap")
def get_pitcher_heatmap(player_id: int, year: int, game_id: str = None):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    if game_id:
        cursor.execute("""
            SELECT p.pitch_id, p.plate_x, p.plate_z,
                   p.pitch_type, p.pitch_velocity, p.pitch_result
            FROM PitchEvent p
            JOIN Game g ON p.game_id = g.game_id
            JOIN Season s ON g.season_id = s.season_id
            WHERE p.pitcher_id = %s
            AND s.year = %s
            AND p.game_id = %s
        """, (player_id, year, game_id))
    else:
        cursor.execute("""
            SELECT p.pitch_id, p.plate_x, p.plate_z,
                   p.pitch_type, p.pitch_velocity, p.pitch_result
            FROM PitchEvent p
            JOIN Game g ON p.game_id = g.game_id
            JOIN Season s ON g.season_id = s.season_id
            WHERE p.pitcher_id = %s
            AND s.year = %s
        """, (player_id, year))
    
    pitches = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return list(pitches)

@app.get("/teams/{team_id}/seasons/{year}")
def get_team_season(team_id: int, year: int):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("""
        SELECT t.name, t.abbreviation, t.city, t.stadium_name,
               s.year, tss.wins, tss.losses, tss.division_rank,
               tss.playoff_result, tss.runs_scored, tss.runs_allowed,
               tss.team_era, tss.team_ops,
               tss.runs_scored - tss.runs_allowed as run_differential
        FROM TeamSeasonStats tss
        JOIN Team t ON tss.team_id = t.team_id
        JOIN Season s ON tss.season_id = s.season_id
        WHERE tss.team_id = %s AND s.year = %s
    """, (team_id, year))
    
    season = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return season

@app.get("/games/{team_id}/{year}")
def get_team_games(team_id: int, year: int):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("""
        SELECT g.game_id, g.date, g.home_score, g.away_score,
               ht.abbreviation as home_team,
               at.abbreviation as away_team,
               CASE WHEN g.home_team_id = %s AND g.home_score > g.away_score THEN 'W'
                    WHEN g.away_team_id = %s AND g.away_score > g.home_score THEN 'W'
                    ELSE 'L' END as result
        FROM Game g
        JOIN Team ht ON g.home_team_id = ht.team_id
        JOIN Team at ON g.away_team_id = at.team_id
        JOIN Season s ON g.season_id = s.season_id
        WHERE (g.home_team_id = %s OR g.away_team_id = %s)
        AND s.year = %s
        ORDER BY g.date
    """, (team_id, team_id, team_id, team_id, year))
    
    games = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return list(games)
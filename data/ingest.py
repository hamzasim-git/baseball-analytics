import psycopg2
import pandas as pd
from pybaseball import statcast, chadwick_register
from dotenv import load_dotenv
import os
from datetime import datetime
from pybaseball import cache
cache.enable()

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)
cursor = conn.cursor()
print("Connected to database successfully")


current_year = datetime.now().year

# Fetch one day of Statcast data
print("Fetching Statcast data...")
all_data = []

for year in range(2015, current_year + 1):
    print(f"Fetching {year} season...")
    try:
        year_data = statcast(start_dt=f"{year}-03-01", end_dt=f"{year}-11-30")
        all_data.append(year_data)
        print(f"{year}: {len(year_data)} rows fetched")
    except Exception as e:
        print(f"Failed to fetch {year}: {e}")

data = pd.concat(all_data, ignore_index=True)
print(f"Total rows fetched: {len(data)}")

# Get unique player IDs from this data
batter_ids = data['batter'].dropna().unique()
pitcher_ids = data['pitcher'].dropna().unique()
all_player_ids = set(batter_ids) | set(pitcher_ids)
print(f"Unique players in this data: {len(all_player_ids)}")

# Fetch player registry and filter to only players in our data
print("Fetching player registry...")
players = chadwick_register()
players_needed = players[players['key_mlbam'].isin(all_player_ids)]
print(f"Players found in registry: {len(players_needed)}")

# Insert players into database
print("Inserting players...")
inserted = 0
skipped = 0

for _, row in players_needed.iterrows():
    try:
        cursor.execute("""
            INSERT INTO Player (player_id, first_name, last_name, debut_date)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (player_id) DO NOTHING
        """, (
            int(row['key_mlbam']),
            row['name_first'],
            row['name_last'],
            int(row['mlb_played_first']) if pd.notna(row['mlb_played_first']) else None
        ))
        inserted += 1
    except Exception as e:
        skipped += 1
        print(f"Skipped player {row['key_mlbam']}: {e}")

conn.commit()
print(f"Players inserted: {inserted}, skipped: {skipped}")

# Insert seasons
print("Inserting seasons...")
current_year = datetime.now().year

for year in range(2015, current_year + 1):
    try:
        cursor.execute("""
            INSERT INTO Season (year, num_teams, playoff_format)
            VALUES (%s, %s, %s)
            ON CONFLICT (year) DO NOTHING
        """, (year, 30, 'standard'))
    except Exception as e:
        print(f"Skipped season {year}: {e}")

conn.commit()
print("Seasons inserted")

# Insert teams
print("Inserting teams...")
teams = [
    ('Toronto Blue Jays', 'TOR', 'Toronto', 'Rogers Centre', 'AL', 'AL East', 1977),
    ('New York Yankees', 'NYY', 'New York', 'Yankee Stadium', 'AL', 'AL East', 1901),
    ('Boston Red Sox', 'BOS', 'Boston', 'Fenway Park', 'AL', 'AL East', 1901),
    ('Baltimore Orioles', 'BAL', 'Baltimore', 'Camden Yards', 'AL', 'AL East', 1901),
    ('Tampa Bay Rays', 'TB', 'St. Petersburg', 'Tropicana Field', 'AL', 'AL East', 1998),
    ('Chicago White Sox', 'CWS', 'Chicago', 'Guaranteed Rate Field', 'AL', 'AL Central', 1900),
    ('Cleveland Guardians', 'CLE', 'Cleveland', 'Progressive Field', 'AL', 'AL Central', 1901),
    ('Detroit Tigers', 'DET', 'Detroit', 'Comerica Park', 'AL', 'AL Central', 1901),
    ('Kansas City Royals', 'KC', 'Kansas City', 'Kauffman Stadium', 'AL', 'AL Central', 1969),
    ('Minnesota Twins', 'MIN', 'Minneapolis', 'Target Field', 'AL', 'AL Central', 1901),
    ('Houston Astros', 'HOU', 'Houston', 'Minute Maid Park', 'AL', 'AL West', 1962),
    ('Los Angeles Angels', 'LAA', 'Anaheim', 'Angel Stadium', 'AL', 'AL West', 1961),
    ('Oakland Athletics', 'ATH', 'Oakland', 'Oakland Coliseum', 'AL', 'AL West', 1901),
    ('Seattle Mariners', 'SEA', 'Seattle', 'T-Mobile Park', 'AL', 'AL West', 1977),
    ('Texas Rangers', 'TEX', 'Arlington', 'Globe Life Field', 'AL', 'AL West', 1961),
    ('Atlanta Braves', 'ATL', 'Atlanta', 'Truist Park', 'NL', 'NL East', 1871),
    ('Miami Marlins', 'MIA', 'Miami', 'loanDepot Park', 'NL', 'NL East', 1993),
    ('New York Mets', 'NYM', 'New York', 'Citi Field', 'NL', 'NL East', 1962),
    ('Philadelphia Phillies', 'PHI', 'Philadelphia', 'Citizens Bank Park', 'NL', 'NL East', 1883),
    ('Washington Nationals', 'WSH', 'Washington', 'Nationals Park', 'NL', 'NL East', 1969),
    ('Chicago Cubs', 'CHC', 'Chicago', 'Wrigley Field', 'NL', 'NL Central', 1876),
    ('Cincinnati Reds', 'CIN', 'Cincinnati', 'Great American Ball Park', 'NL', 'NL Central', 1882),
    ('Milwaukee Brewers', 'MIL', 'Milwaukee', 'American Family Field', 'NL', 'NL Central', 1969),
    ('Pittsburgh Pirates', 'PIT', 'Pittsburgh', 'PNC Park', 'NL', 'NL Central', 1882),
    ('St. Louis Cardinals', 'STL', 'St. Louis', 'Busch Stadium', 'NL', 'NL Central', 1882),
    ('Arizona Diamondbacks', 'AZ', 'Phoenix', 'Chase Field', 'NL', 'NL West', 1998),
    ('Colorado Rockies', 'COL', 'Denver', 'Coors Field', 'NL', 'NL West', 1993),
    ('Los Angeles Dodgers', 'LAD', 'Los Angeles', 'Dodger Stadium', 'NL', 'NL West', 1883),
    ('San Diego Padres', 'SD', 'San Diego', 'Petco Park', 'NL', 'NL West', 1969),
    ('San Francisco Giants', 'SF', 'San Francisco', 'Oracle Park', 'NL', 'NL West', 1883),
]

for team in teams:
    try:
        cursor.execute("""
            INSERT INTO Team (name, abbreviation, city, stadium_name, league, division, founded_year)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (name) DO NOTHING
        """, team)
    except Exception as e:
        print(f"Skipped team {team[0]}: {e}")

conn.commit()
print("Teams inserted") 

# Build team lookup dictionary
cursor.execute("SELECT team_id, abbreviation FROM Team")
team_lookup = {row[1]: row[0] for row in cursor.fetchall()}
print(f"Team lookup built: {len(team_lookup)} teams")

# Build season lookup dictionary
cursor.execute("SELECT season_id, year FROM Season")
season_lookup = {row[1]: row[0] for row in cursor.fetchall()}
print(f"Season lookup built: {len(season_lookup)} seasons")


# Insert games
print("Inserting games...")
games_inserted = 0
games_skipped = 0

games = data[['game_pk', 'game_date', 'home_team', 'away_team',
              'home_score', 'away_score', 'game_year']].drop_duplicates(subset=['game_pk'])

for _, row in games.iterrows():
    try:
        home_id = team_lookup.get(row['home_team'])
        away_id = team_lookup.get(row['away_team'])
        season_id = season_lookup.get(int(row['game_year']))

        if not home_id or not away_id or not season_id:
            games_skipped += 1
            continue

        cursor.execute("""
            INSERT INTO Game (game_id, season_id, date, home_team_id, away_team_id, home_score, away_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (game_id) DO NOTHING
        """, (
            str(row['game_pk']),
            season_id,
            row['game_date'],
            home_id,
            away_id,
            int(row['home_score']) if pd.notna(row['home_score']) else None,
            int(row['away_score']) if pd.notna(row['away_score']) else None
        ))
        games_inserted += 1
    except Exception as e:
        games_skipped += 1
        print(f"Skipped game {row['game_pk']}: {e}")

conn.commit()
print(f"Games inserted: {games_inserted}, skipped: {games_skipped}")

# Insert hit events
print("Inserting hit events...")
hits_inserted = 0
hits_skipped = 0

# Filter to only batted ball events
hit_data = data[data['events'].notna() & data['hc_x'].notna()].copy()
# Insert any missing players as unknowns
all_batter_ids = data['batter'].dropna().unique()
all_pitcher_ids = data['pitcher'].dropna().unique()
all_ids = set(all_batter_ids) | set(all_pitcher_ids)

for pid in all_ids:
    cursor.execute("""
        INSERT INTO Player (player_id, first_name, last_name)
        VALUES (%s, %s, %s)
        ON CONFLICT (player_id) DO NOTHING
    """, (int(pid), 'Unknown', 'Unknown'))

conn.commit()
print("Missing players filled in")
for _, row in hit_data.iterrows():
    try:
        cursor.execute("""
            INSERT INTO HitEvent (game_id, batter_id, pitcher_id, hit_type, 
                                  coord_x, coord_y, exit_velocity, launch_angle, distance_ft)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            str(row['game_pk']),
            int(row['batter']),
            int(row['pitcher']),
            row['events'],
            float(row['hc_x']) if pd.notna(row['hc_x']) else None,
            float(row['hc_y']) if pd.notna(row['hc_y']) else None,
            float(row['launch_speed']) if pd.notna(row['launch_speed']) else None,
            float(row['launch_angle']) if pd.notna(row['launch_angle']) else None,
            int(row['hit_distance_sc']) if pd.notna(row['hit_distance_sc']) else None
        ))
        hits_inserted += 1
    except Exception as e:
        conn.rollback()
        hits_skipped += 1
        if hits_skipped <= 3:
            print(f"Skipped hit error: {e}")

conn.commit()
print(f"Hit events inserted: {hits_inserted}, skipped: {hits_skipped}")

# Insert pitch events
print("Inserting pitch events...")
pitches_inserted = 0
pitches_skipped = 0

pitch_data = data[data['pitch_type'].notna()].copy()

for _, row in pitch_data.iterrows():
    try:
        cursor.execute("""
            INSERT INTO PitchEvent (game_id, pitcher_id, batter_id, pitch_type,
                                    pitch_velocity, plate_x, plate_z, pitch_result)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            str(row['game_pk']),
            int(row['pitcher']),
            int(row['batter']),
            row['pitch_type'],
            float(row['release_speed']) if pd.notna(row['release_speed']) else None,
            float(row['plate_x']) if pd.notna(row['plate_x']) else None,
            float(row['plate_z']) if pd.notna(row['plate_z']) else None,
            row['description']
        ))
        pitches_inserted += 1
    except Exception as e:
        conn.rollback()
        pitches_skipped += 1
        if pitches_skipped <= 3:
            print(f"Skipped pitch error: {e}")

conn.commit()
print(f"Pitch events inserted: {pitches_inserted}, skipped: {pitches_skipped}")

# Retry 2023
print("Retrying 2023...")
try:
    data_2023 = statcast(start_dt="2023-03-01", end_dt="2023-11-30")
    all_data.append(data_2023)
    print(f"2023 retry: {len(data_2023)} rows")
except Exception as e:
    print(f"2023 retry failed: {e}")
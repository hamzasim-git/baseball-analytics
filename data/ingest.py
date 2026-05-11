import psycopg2
import pandas as pd
from pybaseball import statcast, playerid_lookup, chadwick_register
from dotenv import load_dotenv
import os

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

cursor = conn.cursor()
print("Connected to database successfully")

# Pull one day of Statcast data to test
print("Fetching Statcast data...")
data = statcast(start_dt="2024-04-01", end_dt="2024-04-01")

print(f"Rows fetched: {len(data)}")
print(data.columns.tolist())

print(data[['pitch_type', 'release_speed', 'plate_x', 
            'plate_z', 'description', 'game_pk', 
            'batter', 'pitcher', 'events', 
            'hc_x', 'hc_y', 'launch_speed', 
            'launch_angle', 'hit_distance_sc']].head(3))
# Keep only pitches that were hit into play
hit_events = data[data['events'].notna()]

# Keep only home runs
home_runs = hit_events[hit_events['events'] == 'home_run']

print(f"Home runs in this day: {len(home_runs)}")
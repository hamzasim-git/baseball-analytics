# ⚾ Baseball Analytics

A full-stack baseball analytics web app powered by real MLB Statcast data.
Built with PostgreSQL, Python, FastAPI, and React.

![ERD Diagram](docs/erd.png)

## What it does

**Stats Section** — Browse all 30 MLB teams across seasons from 2015 to present.
View season summaries including wins, losses, ERA, OPS, run differential, 
and playoff results. Drill into any season to see individual game results.

**Visuals Section** — Select any MLB player and season to see an interactive
home run spray chart — every home run plotted on a field diagram with exit
velocity, launch angle, and distance on hover. Pitchers get a pitch location
heatmap showing where they located every pitch.

## Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Database | PostgreSQL          |
| ETL      | Python, pybaseball  |
| Backend  | Python, FastAPI     |
| Frontend | React, Chart.js     |

## Database Design

Designed using ER modelling and normalized to 3NF.
7 entities covering teams, seasons, games, players,
and Statcast hit and pitch level events.

See full ERD in `/docs/erd.png`

## Progress

### Phase 1 — Database Design ✅
- Designed 7 entities and 13 relationships using ER modelling
- Full ERD with cardinality and participation constraints

![ERD](docs/erd.png)

### Phase 2 — Schema Implementation ✅
- Implemented all 8 tables in PostgreSQL with foreign keys, constraints, and cascade rules
- Normalized to 3NF

![Schema Terminal](docs/phase2-schema-terminal.png)

### Phase 3 — Data Ingestion ✅
- Built ETL pipeline using Python and pybaseball
- Loaded full MLB Statcast dataset 2015 to present

| Table | Rows |
|-------|------|
| Teams | 30 |
| Seasons | 12 |
| Players | 7,349 |
| Games | 27,450 |
| Hit Events | 2,921,059 |
| Pitch Events | 900,387 |

![Database Counts](docs/phase3-database-counts.png)

### Phase 4 — Backend API 🔄 In progress
### Phase 5 — Frontend 🔄 Coming soon

## Author

Hamzah Asim
Computer Science, York University  
[LinkedIn](https://www.linkedin.com/in/hamzah-asim/) 
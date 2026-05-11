CREATE TABLE Season(
    season_id      SERIAL PRIMARY KEY,
    year           INT NOT NULL UNIQUE,
    num_teams      INT NOT NULL,
    playoff_format VARCHAR(50) NOT NULL

);
CREATE TABLE Team (
    team_id         SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    abbreviation    VARCHAR(10) NOT NULL UNIQUE,
    city            VARCHAR(100) NOT NULL,
    stadium_name    VARCHAR(100) NOT NULL,
    league          VARCHAR(2) NOT NULL,
    division        VARCHAR(20) NOT NULL,
    founded_year    INT NOT NULL
);

CREATE TABLE Player (
    player_id       SERIAL PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    nationality     VARCHAR(50) NOT NULL,
    bats            CHAR(1) NOT NULL,
    throws          CHAR(1) NOT NULL,
    birth_date      DATE NOT NULL,
    debut_date      DATE NOT NULL
);

CREATE table Game (
    game_id         VARCHAR(20) PRIMARY KEY,
    season_id       INT NOT NULL,
    date            DATE NOT NULL,
    home_team_id    INT NOT NULL,
    away_team_id    INT NOT NULL,
    home_score      INT NOT NULL,
    away_score      INT NOT NULL,
    FOREIGN KEY (season_id) REFERENCES Season(season_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (home_team_id) REFERENCES Team(team_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (away_team_id) REFERENCES Team(team_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE TeamSeasonStats (
    stat_id         SERIAL PRIMARY KEY,
    team_id         INT NOT NULL,
    season_id       INT NOT NULL,
    wins            INT NOT NULL,
    losses          INT NOT NULL,
    division_rank   INT NOT NULL,
    playoff_result  VARCHAR(20) NOT NULL,
    runs_scored     INT NOT NULL,
    runs_allowed    INT NOT NULL,
    team_era        DECIMAL(4,2) NOT NULL,
    team_ops        DECIMAL(4,3) NOT NULL,
    FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (season_id) REFERENCES Season(season_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (team_id, season_id)
);

CREATE TABLE HitEvent (
    hit_id          SERIAL PRIMARY KEY,
    game_id         VARCHAR(20) NOT NULL,
    batter_id       INT NOT NULL,
    pitcher_id      INT NOT NULL,
    hit_type        VARCHAR(20) NOT NULL,
    coord_x         DECIMAL(6,2) NOT NULL,
    coord_y         DECIMAL(6,2) NOT NULL,
    exit_velocity   DECIMAL(5,2) NOT NULL,
    launch_angle    DECIMAL(5,2) NOT NULL,
    distance_ft     INT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES Game(game_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (batter_id) REFERENCES Player(player_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (pitcher_id) REFERENCES Player(player_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PitchEvent (
    pitch_id        SERIAL PRIMARY KEY,
    game_id         VARCHAR(20) NOT NULL,
    pitcher_id      INT NOT NULL,
    batter_id       INT NOT NULL,
    pitch_type      VARCHAR(10) NOT NULL,
    pitch_velocity  DECIMAL(5,2) NOT NULL,
    plate_x         DECIMAL(5,2) NOT NULL,
    plate_z         DECIMAL(5,2) NOT NULL,
    pitch_result    VARCHAR(30) NOT NULL,
    FOREIGN KEY (game_id) REFERENCES Game(game_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (pitcher_id) REFERENCES Player(player_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (batter_id) REFERENCES Player(player_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PlayerGamePosition (
    player_id       INT NOT NULL,
    game_id         VARCHAR(20) NOT NULL,
    position        VARCHAR(5) NOT NULL,
    is_starter      BOOLEAN NOT NULL,
    PRIMARY KEY (player_id, game_id),
    FOREIGN KEY (player_id) REFERENCES Player(player_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Game(game_id) ON DELETE CASCADE ON UPDATE CASCADE
);
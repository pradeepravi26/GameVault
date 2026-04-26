DROP DATABASE IF EXISTS game_vault;

CREATE DATABASE game_vault;

USE game_vault;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);

CREATE TABLE sessions (
    session_id CHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE games (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    genre_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE platforms (
    platform_id INT AUTO_INCREMENT PRIMARY KEY,
    platform_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE collections (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    collection_name VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT uq_collections_user_name UNIQUE (user_id, collection_name),
    CONSTRAINT fk_collections_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    CONSTRAINT uq_ratings_user_game UNIQUE (user_id, game_id),
    CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ratings_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE TABLE game_images (
    game_id INT NOT NULL,
    image_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    PRIMARY KEY (game_id, image_id),
    CONSTRAINT fk_game_images_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE TABLE game_release_dates (
    game_id INT NOT NULL,
    release_date DATE NOT NULL,
    PRIMARY KEY (game_id, release_date),
    CONSTRAINT fk_game_release_dates_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE TABLE numeric_scores (
    rating_id INT PRIMARY KEY,
    score DECIMAL(3, 1) NOT NULL,
    CONSTRAINT chk_numeric_scores_score CHECK (
        score BETWEEN 1
        AND 10
    ),
    CONSTRAINT fk_numeric_scores_rating FOREIGN KEY (rating_id) REFERENCES ratings(rating_id) ON DELETE CASCADE
);

CREATE TABLE review_texts (
    rating_id INT PRIMARY KEY,
    review_body TEXT NOT NULL,
    is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_review_texts_rating FOREIGN KEY (rating_id) REFERENCES ratings(rating_id) ON DELETE CASCADE
);

CREATE TABLE collection_games (
    collection_id INT NOT NULL,
    game_id INT NOT NULL,
    PRIMARY KEY (collection_id, game_id),
    CONSTRAINT fk_collection_games_collection FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
    CONSTRAINT fk_collection_games_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE TABLE collection_likes (
    collection_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (collection_id, user_id),
    CONSTRAINT fk_collection_likes_collection FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
    CONSTRAINT fk_collection_likes_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE game_genres (
    game_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (game_id, genre_id),
    CONSTRAINT fk_game_genres_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT fk_game_genres_genre FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
);

CREATE TABLE game_platforms (
    game_id INT NOT NULL,
    platform_id INT NOT NULL,
    PRIMARY KEY (game_id, platform_id),
    CONSTRAINT fk_game_platforms_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT fk_game_platforms_platform FOREIGN KEY (platform_id) REFERENCES platforms(platform_id) ON DELETE CASCADE
);

CREATE INDEX idx_games_title ON games(title);

CREATE INDEX idx_ratings_game_id ON ratings(game_id);

CREATE INDEX idx_ratings_user_id ON ratings(user_id);

CREATE INDEX idx_collections_user_id ON collections(user_id);

CREATE INDEX idx_collection_likes_user_id ON collection_likes(user_id);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX idx_game_release_dates_release_date ON game_release_dates(release_date);

CREATE INDEX idx_game_genres_genre_id ON game_genres(genre_id);

CREATE INDEX idx_game_platforms_platform_id ON game_platforms(platform_id);
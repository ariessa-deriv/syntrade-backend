-- Create a database called syntrade
CREATE DATABASE syntrade;

-- Connect to syntrade database
\c syntrade

-- Create enum type called synthetic_type
CREATE TYPE synthetic_type AS ENUM ( 'boom_100', 'boom_300', 'boom_500', 'crash_100', 'crash_300', 'crash_500', 'volatility_10', 'volatility_25' );

-- Create enum type called trade_type
CREATE TYPE trade_type AS ENUM ( 'buy', 'sell' );

-- Create a table called users
CREATE TABLE IF NOT EXISTS users (
user_id serial PRIMARY KEY,
email VARCHAR (255) UNIQUE NOT NULL,
password CHAR (60) NOT NULL,
wallet_balance FLOAT NOT NULL DEFAULT 10000.00,
date_joined BIGINT NOT NULL DEFAULT extract(epoch from now()));

-- Create a table called trades
CREATE TABLE IF NOT EXISTS trades (
trade_id serial PRIMARY KEY,
user_id serial,
synthetic_type synthetic_type NOT NULL,
currency CHAR (3) NOT NULL DEFAULT 'usd',
trade_time BIGINT NOT NULL DEFAULT extract(epoch from now()),
trade_type trade_type NOT NULL,
trade_result FLOAT NOT NULL,
current_wallet_balance FLOAT NOT NULL,
FOREIGN KEY (user_id)
REFERENCES users (user_id) ON DELETE CASCADE
);

-- Create index in table trades
CREATE INDEX idx_user_id ON trades(user_id);

-- Add new users into table users
INSERT INTO users (email, password) 
VALUES 
('test123@gmail.com', '$2b$10$WOwa8qQuia0.MtkXLSTbqOsCBVFhqggB5nW5eo9Q9.rvqZRHFmlRG'),
('johndoe@gmail.com', '$2b$10$Z7wSUnEXLLs1kpo2sSWfwe..pTuruIboPgiZ5U6wWAQTbZcTwlbwC'),
('janet@gmail.com', '$2b$10$eKRKvtkQdIVeVQ30PnsfdOxKc3zAWgezWUM9dKtp.72Q3hHrR7VRq')
RETURNING *;

-- Add new trades into table trades
INSERT INTO trades (user_id, synthetic_type, trade_type, trade_result, current_wallet_balance) 
VALUES 
(1, 'boom_100', 'buy', -1000.87, 9000),
(2, 'volatility_10', 'sell', -2000.99, 8888),
(3, 'crash_500', 'buy', +2345.00, 8000)
RETURNING *;
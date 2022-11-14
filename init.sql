-- Create a database called syntrade
CREATE DATABASE syntrade;

-- Connect to syntrade database
\c syntrade

-- Create enum type called synthetic_type
CREATE TYPE synthetic_type AS ENUM ( 
'boom_100_rise',
'boom_100_fall',
'boom_100_multiplier_50_up',
'boom_100_multiplier_50_down',
'boom_100_multiplier_100_up',
'boom_100_multiplier_100_down',
'boom_100_multiplier_200_up',
'boom_100_multiplier_200_down',
'boom_100_multiplier_300_up',
'boom_100_multiplier_300_down',
'crash_100_rise',
'crash_100_fall',
'crash_100_multiplier_50_up',
'crash_100_multiplier_50_down',
'crash_100_multiplier_100_up',
'crash_100_multiplier_100_down',
'crash_100_multiplier_200_up',
'crash_100_multiplier_200_down',
'crash_100_multiplier_300_up',
'crash_100_multiplier_300_down',
'boom_300_multiplier_50_up',
'boom_300_multiplier_50_down',
'boom_300_multiplier_100_up',
'boom_300_multiplier_100_down',
'boom_300_multiplier_200_up',
'boom_300_multiplier_200_down',
'boom_300_multiplier_300_up',
'boom_300_multiplier_300_down',
'boom_500_multiplier_50_up',
'boom_500_multiplier_50_down',
'boom_500_multiplier_100_up',
'boom_500_multiplier_100_down',
'boom_500_multiplier_200_up',
'boom_500_multiplier_200_down',
'boom_500_multiplier_300_up',
'boom_500_multiplier_300_down',
'crash_300_multiplier_50_up',
'crash_300_multiplier_50_down',
'crash_300_multiplier_100_up',
'crash_300_multiplier_100_down',
'crash_300_multiplier_200_up',
'crash_300_multiplier_200_down',
'crash_300_multiplier_300_up',
'crash_300_multiplier_300_down',
'crash_500_multiplier_50_up',
'crash_500_multiplier_50_down',
'crash_500_multiplier_100_up',
'crash_500_multiplier_100_down',
'crash_500_multiplier_200_up',
'crash_500_multiplier_200_down',
'crash_500_multiplier_300_up',
'crash_500_multiplier_300_down',
'volatility_10_multiplier_100_up',
'volatility_10_multiplier_100_down',
'volatility_10_multiplier_300_up',
'volatility_10_multiplier_300_down',
'volatility_10_multiplier_500_up',
'volatility_10_multiplier_500_down',
'volatility_10_even',
'volatility_10_odd',
'volatility_10_matches',
'volatility_10_differs',
'volatility_25_multiplier_100_up',
'volatility_25_multiplier_100_down',
'volatility_25_multiplier_300_up',
'volatility_25_multiplier_300_down',
'volatility_25_multiplier_500_up',
'volatility_25_multiplier_500_down',
'volatility_25_even',
'volatility_25_odd',
'volatility_25_matches',
'volatility_25_differs'
);

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

-- Add new buy trades into table trades
INSERT INTO trades (user_id, synthetic_type, trade_type, trade_result, current_wallet_balance) 
VALUES 
(1, 'boom_100_rise', 'buy', -1000.87, 9000),
(2, 'volatility_10_even', 'buy', -2000.99, 8888),
(3, 'crash_500_fall', 'buy', -2345.00, 8000)
RETURNING *;

-- Add new sell trades into table trades
INSERT INTO trades (user_id, synthetic_type, trade_type, trade_result, current_wallet_balance) 
VALUES 
(1, 'boom_100_rise', 'sell', +1000.87, 9000),
(2, 'volatility_10_even', 'sell', +2000.99, 8888),
(3, 'crash_500_fall', 'sell', +2345.00, 8000)
RETURNING *;
-- Create a database called syntrade
CREATE DATABASE syntrade;

-- Connect to syntrade database
\c syntrade

-- Create enum type called synthetic_type
CREATE TYPE synthetic_type AS ENUM ( 
'boom_100_rise',
'boom_100_fall',
'crash_100_rise',
'crash_100_fall',
'volatility_10_even',
'volatility_10_odd',
'volatility_10_matches',
'volatility_10_differs',
'volatility_10_rise',
'volatility_10_fall',
'volatility_25_even',
'volatility_25_odd',
'volatility_25_matches',
'volatility_25_differs',
'volatility_25_rise',
'volatility_25_fall'
);

-- Create enum type called transaction_type
CREATE TYPE transaction_type AS ENUM ( 'buy', 'sell' );

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
currency CHAR (3) NOT NULL DEFAULT 'myr',
transaction_time BIGINT NOT NULL,
transaction_type transaction_type NOT NULL,
transaction_amount FLOAT NOT NULL,
current_wallet_balance FLOAT NOT NULL,
ticks INT NOT NULL CONSTRAINT within_range
  CHECK ("ticks" <@ int4range(1,11)),
current_price FLOAT NOT NULL,
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
INSERT INTO trades (user_id, synthetic_type, transaction_time, transaction_type, transaction_amount, current_wallet_balance, ticks, current_price) 
VALUES 
(1, 'boom_100_rise', 1669996752, 'buy', -1000.87, 9000, 5, 9000.00),
(2, 'volatility_10_even', 1669996752, 'buy', -2000.99, 8888, 2, 10100.90),
(3, 'crash_100_fall', 1669996752, 'buy', -2345.00, 8000, 4, 9777.25)
RETURNING *;

-- Add new sell trades into table trades
INSERT INTO trades (user_id, synthetic_type, transaction_time, transaction_type, transaction_amount, current_wallet_balance, ticks, current_price) 
VALUES 
(1, 'boom_100_rise', 1669996762, 'sell', +1000.87, 9000, 5, 10000.00),
(2, 'volatility_10_even', 1669996762, 'sell',  +2000.99, 8888, 2, 10100.20),
(3, 'crash_100_fall', 1669996762, 'sell', +2345.00, 8000, 4, 9654.23)
RETURNING *;
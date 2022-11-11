<h1 align="center">Syntrade Backend</h1>

<p align="center">  
📈 Syntrade Backend is a GraphQL API server built on top of Express</a>.
</p>
</br>

## API endpoints

- Query
  - me
  - users
  - user
  - trades
  - trade

* Mutation
  - signup
  - login
  - updateUser
  - deleteUser
  - createTrade
  - forgotPassword

</br>

## Technologies Used

- Express
- GraphQL

</br>

## Run It Locally

1. Clone repository

```
git clone git@github.com:ariessa-deriv/syntrade-backend.git
```

2. Inside syntrade-backend folder, create .env file

```
HOST=""
PORT=""
POSTGRESQL_DATABASE=""
POSTGRESQL_USER=""
POSTGRESQL_PASSWORD=""
JWT_SECRET=""
```

3. Inside syntrade-backend folder, start service defined in docker-compose.yml

```
docker-compose up -d
```

4. Get the container ID for the recently created Docker container

```
docker ps -a
```

5. Start a Bash session inside the Docker container

```
docker exec -it $container_id bash
```

Example: docker exec -it 5c83c63a56cc bash

6. Connect to Postgresql host

```
psql -h localhost -p 5432 -U test-user -W
```

7. Create a database called syntrade

```
CREATE DATABASE syntrade;
```

8. Connect to syntrade database

```
\c syntrade
```

9. Create enum type called synthetic_type

```
CREATE TYPE synthetic_type AS ENUM ( 'Boom 100', 'Boom 300', 'Boom 500', 'Crash 100', 'Crash 300', 'Crash 500', 'Volatility 10', 'Volatility 25' );
```

10. Create enum type called trade_type

```
CREATE TYPE trade_type AS ENUM ( 'buy', 'sell' );
```

11. Create a table called users

```
CREATE TABLE users (
user_id serial PRIMARY KEY,
email VARCHAR (255) UNIQUE NOT NULL,
password CHAR (60) NOT NULL,
wallet_balance FLOAT NOT NULL DEFAULT 10000.00,
date_joined BIGINT NOT NULL DEFAULT extract(epoch from now()));
```

12. Create a table called trades

```
CREATE TABLE trades (
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
```

13. Add new users into users table

```
INSERT INTO users (email, password)
VALUES
('test123@gmail.com', '$2b$10$WOwa8qQuia0.MtkXLSTbqOsCBVFhqggB5nW5eo9Q9.rvqZRHFmlRG'),
('johndoe@gmail.com', '$2b$10$Z7wSUnEXLLs1kpo2sSWfwe..pTuruIboPgiZ5U6wWAQTbZcTwlbwC'),
('janet@gmail.com', '$2b$10$eKRKvtkQdIVeVQ30PnsfdOxKc3zAWgezWUM9dKtp.72Q3hHrR7VRq')
RETURNING *;
```

14. Add new trades into table trades

```
INSERT INTO trades (user_id, synthetic_type, trade_type, trade_result, current_wallet_balance)
VALUES
(1, 'Boom 100', 'buy', -1000.87, 9000),
(2, 'Volatility 10', 'sell', -2000.99, 8888),
(3, 'Crash 500', 'buy', +2345.00, 8000)
RETURNING *;
```

15. Inside syntrade-backend folder, install npm packages

```
npm install
```

16. Run the GraphQL API server

```
npm run dev
```

Open [http://localhost:4000](http://localhost:400) with your browser to use GraphiQL.

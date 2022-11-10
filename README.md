<h1 align="center">Syntrade Backend</h1>

<p align="center">  
📈 Syntrade Backend is a GraphQL API server built on top of Express</a>.
</p>
</br>

## API endpoints

- Query
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

9. Create a table called users

```
CREATE TABLE users (
user_id serial PRIMARY KEY,
email VARCHAR (255) UNIQUE NOT NULL,
password VARCHAR (12) NOT NULL,
wallet_balance FLOAT NOT NULL DEFAULT 10000,
date_joined BIGINT NOT NULL DEFAULT extract(epoch from now()));
```

10. Create a table called trades

```
CREATE TABLE trades (
trade_id serial PRIMARY KEY,
user_id serial,
type INT NOT NULL,
currency VARCHAR (20) NOT NULL DEFAULT 'usd',
trade_time BIGINT NOT NULL DEFAULT extract(epoch from now()),
trade_type VARCHAR (20) NOT NULL,
is_debit boolean NOT NULL,
current_wallet_balance FLOAT NOT NULL,
FOREIGN KEY (user_id)
REFERENCES users (user_id) ON DELETE CASCADE
);
```

11. Add new users into users table

```
INSERT INTO users (email, password)
VALUES
('test123@gmail.com', 'test123!'),
('johndoe@gmail.com', 'P4ssword!'),
('janet@gmail.com', 'myP4ssword!')
RETURNING *;
```

12. Add new trades into table trades

```
INSERT INTO trades (user_id, type, trade_type, is_debit, current_wallet_balance)
VALUES
(1, 1, 'buy', true, 9000),
(2, 2, 'sell', false, 8888),
(2, 4, 'buy', true, 8000)
RETURNING *;
```

Open [http://localhost:4000](http://localhost:400) with your browser to use GraphiQL.

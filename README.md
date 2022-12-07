<h1 align="center">Syntrade Backend</h1>

<p align="center">  
📈 Syntrade Backend is a GraphQL API server built on top of Express</a>.
</p>
</br>

## Project Architecture

<p align="center">
<img src="/previews/project_architecture.png"/>
</p>

Backend uses server sent event to get real-time price from 4 in-house synthetic models:

- Boom 100
- Crash 100
- Volatility 10
- Volatility 25

</br>

## Pricing Data Flow

Every 1 second, pricing server sends pricing data to both backend and frontend.

- Backend stores the pricing data inside redis. Why? For historical data purposes. Whenever user performs a trade, the price for specified model at a specified time will be taken from redis.
- Whenever the trade page is load for the first time or the synthetic model type is changed, frontend uses new data that it gets from pricing server sent events to keep on drawing the chart as time progresses.

</br>

## Entity Relationship Diagram

<p align="center">
<img src="/previews/entity_relationship_diagram.png"/>
</p>

</br>

## Technologies Used

- [Docker](https://www.docker.com/)
- [Express](https://www.npmjs.com/package/express)
- [Flask](<https://en.wikipedia.org/wiki/Flask_(web_framework)>)
- [GraphQL](https://www.npmjs.com/package/graphql)
- [Nginx](https://www.nginx.com/)
- [NodeJS](https://nodejs.org/en/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Server Sent Events](https://en.wikipedia.org/wiki/Server-sent_events)

</br>

## Prerequisites

Make sure that your node version is v14.20.0. If your node version is different, install the specific node version.

```
node -v

# v14.20.0
```

Make sure that your npm version 8.19.3. If your npm version is different, install the specific npm version.

```
npm -v

# 8.19.3
```

</br>

## Run It Locally

Clone repository

```
git clone git@github.com:ariessa-deriv/syntrade-backend.git
```

Create .env file and insert values

```
BACKEND_PORT=""
POSTGRES_HOST=""
POSTGRES_PORT=""
POSTGRES_DATABASE=""
POSTGRES_USER=""
POSTGRES_PASSWORD=""
REDIS_PASSWORD=""
REDIS_PORT=""
REDIS_USER=""
JWT_SECRET=""
FLASK_HOST=""
FLASK_PORT=""
FLASK_SECRET_KEY=""
FRONTEND_DEV_URL=""
FRONTEND_URL=""
GMAIL_USER=""
GMAIL_PASSWORD=""
```

Build and start all Docker containers

```
sh start.sh
```

</br>

## Troubleshooting

You might not need to rebuild all containers again so use the following commands as you see fit.

- **Error**\
  docker: Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Post http://%2Fvar%2Frun%2Fdocker.sock/v1.35/containers/create: dial unix /var/run/docker.sock: connect: permission denied. See 'docker run --help'.

  **Solution**

  ```
  sudo chmod 666 /var/run/docker.sock
  ```

  </br>

- **Error**\
  ERROR: for postgres Cannot start service postgres: driver failed programming external connectivity on endpoint syntrade-database (1a20e2684584f681b8c8c84226cdf25b25b6b32c195ecd255261f43e20123cde): Error starting userland proxy: listen tcp4 0.0.0.0:5432: bind: address already in use\
  ERROR: Encountered errors while bringing up the project.

  **Solution**

  Check which process is running on port 5432 and kill the process by PID

  ```
  sudo kill -9 $(sudo lsof -i :5432 | awk 'NR==2{print $2}')
  ```

  </br>

- **Error**\
  Containers with name of `syntrade-backend` or `syntrade-pricing` fails to be build or start up.

  **Solution**\
  Clean your repository by running the `clean.sh` script. This script will remove all Docker containers and images.

  ```
  sh clean.sh
  ```

  Build and start all Docker containers

  ```
  sh start.sh
  ```

  </br>

- **Error**\
  npm ERR! Failed at the syntrade-backend@1.0.0 dev script.
  npm ERR! This is probably not a problem with npm. There is likely additional logging output above.
  npm WARN Local package.json exists, but node_modules missing, did you mean to install?

  **Solution**

  Navigate to app folder and install packages using npm

  ```
  cd app && npm install
  ```

</br>

## Rest API endpoints

Example of sending GET request using cURL

```
curl --location --request POST 'http://localhost:4000/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@gmail.com",
    "password": "Abc1234!"
}'
```

- login
- logout

</br>

## GraphQL API endpoints

Example of sending GET request using cURL

```
curl --location --request GET 'http://localhost:4000' \
--header 'Content-Type: application/json' \
--data-raw '{"query":" {\n    tradesByUserId (userId: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwY2Q1MTA2Mi01Y2UxLTQ5ZTAtYjllMy04YWYzZGQ5ODNiNGEiLCJpYXQiOjE2NzAzMTU0ODYsImV4cCI6MTY3MDM0NDI4Nn0.bfBHy-sOXphI0RZPyoiiX-xkI33Wd560O9Fq-wtU0n0\"){\n      trade_id\n      synthetic_type\n      currency\n      transaction_time\n      transaction_type\n      transaction_amount\n      current_wallet_balance\n    }\n  }","variables":{}}' | json_pp
```

</br>

### Query

- trade

  ```
  # Get trades by user id
  {
    tradesByUserId {
      trade_id
      synthetic_type
      currency
      transaction_time
      transaction_type
      transaction_amount
      current_wallet_balance
    }
  }
  ```

- prices

  ```
  # Get call and put prices of a synthetic model
  query {
    prices(wagerType: "stake", syntheticModel: "boom_100", tradeType: "rise_fall", wagerAmount: 20, ticks: 5)
  }
  ```

- currentBalance
  ```
  # Get current wallet balance by user id
  {
    currentBalance
  }
  ```

### Mutation

- signup

  ```
  # Sign up
  mutation {
    signup(email: "randomemail@gmail.com", password: "Abc4123!") {
      email,
      password
    }
  }
  ```

- createTrade

  ```
  # Create new buy trade and execute sell trade when end time is reached
  mutation {
    createTrade(user_id: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwY2Q1MTA2Mi01Y2UxLTQ5ZTAtYjllMy04YWYzZGQ5ODNiNGEiLCJpYXQiOjE2NzAzMTU0ODYsImV4cCI6MTY3MDM0NDI4Nn0.bfBHy-sOXphI0RZPyoiiX-xkI33Wd560O9Fq-wtU0n0", synthetic_type: "volatility_10_rise", wager_amount: 198, option_type: "put", ticks: 4)
  }

  # Special case: Create buy and sell trades for matches differs trade type
  mutation {
    createTrade(user_id: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwY2Q1MTA2Mi01Y2UxLTQ5ZTAtYjllMy04YWYzZGQ5ODNiNGEiLCJpYXQiOjE2NzAzMTU0ODYsImV4cCI6MTY3MDM0NDI4Nn0.bfBHy-sOXphI0RZPyoiiX-xkI33Wd560O9Fq-wtU0n0", synthetic_type: "volatility_25_matches", wager_amount: 198, option_type: "call", ticks: 7, last_digit_prediction: 2)
  }

  ```

- resetBalance

  ```
  # Reset wallet balance by user id
  mutation {
    resetBalance(user_id: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwY2Q1MTA2Mi01Y2UxLTQ5ZTAtYjllMy04YWYzZGQ5ODNiNGEiLCJpYXQiOjE2NzAzMTU0ODYsImV4cCI6MTY3MDM0NDI4Nn0.bfBHy-sOXphI0RZPyoiiX-xkI33Wd560O9Fq-wtU0n0")
  }
  ```

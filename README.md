<h1 align="center">Syntrade Backend</h1>

<p align="center">  
📈 Syntrade Backend is a GraphQL API server built on top of Express</a>.
</p>
</br>

## Technologies Used

- [Express](https://www.npmjs.com/package/express)
- [GraphQL](https://www.npmjs.com/package/graphql)
- [Server Sent Events](https://en.wikipedia.org/wiki/Server-sent_events)

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

Install packages using npm

```
cd app && npm install && cd ..
```

Build and start Docker containers in detached mode

```
docker-compose --env-file .env --file docker-compose.yml up -d
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
  Clean your repository by running the `clean.sh` script.

  ```
  sh clean.sh
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

## API endpoints

Example of sending GET request using cURL

```
curl --location --request GET 'http://localhost:4000' \
--header 'Content-Type: application/json' \
--data-raw '{"query":"{\n  users {\n    user_id\n    email\n    password\n    wallet_balance\n    date_joined\n    trades {\n      trade_id\n      user_id\n      synthetic_type\n      currency\n      trade_time\n      trade_type\n      trade_result\n      current_wallet_balance\n    }\n  }\n}","variables":{}}' | json_pp
```

### Query

- user

  ```
  # Get user by user_id
  {
    user(user_id: 1) {
      user_id
      email
      password
      wallet_balance
      date_joined
    }
  }
  ```

- trade

  ```
  # Get trade by trade id
  {
    trade(trade_id: 1) {
      trade_id
      user_id
      synthetic_type
      currency
      trade_time
      transaction_type
      trade_result
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
    currentBalance(user_id: 1)
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
- login
  ```
  # Login
  mutation {
    login(email: "randomemail@gmail.com", password: "Abc4123!") {
      email,
      password
    }
  }
  ```
- deleteAccount
  ```
  # Delete user account by user_id. This will also delete user's trades
  mutation {
    deleteUser(user_id: 3) {
      user_id
      email
      wallet_balance
      date_joined
    }
  }
  ```
- createTrade

  ```
  # Create new buy trade and execute sell trade when end time is reached
  mutation {
    createTrade(user_id: 1, synthetic_type: "volatility_10_rise", wager_amount: 198, option_type: "put", ticks: 4)
  }

  # Special case: Create buy and sell trades for matches differs trade type
  mutation {
    createTrade(user_id: 1, synthetic_type: "volatility_25_matches", wager_amount: 198, option_type: "call", ticks: 7, last_digit_prediction: 2)
  }

  ```

- resetPassword

  ```
  # Reset user password
  mutation {
    resetPassword(email: "ariessa@besquare.com.my")
  }
  ```

- changePassword (WIP)

  ```
  # Change user's password
  mutation {
    changePassword(user_id: 1, password: "Abc1234!")
  }
  ```

- resetBalance

  ```
  # Reset wallet balance by user id
  mutation {
    resetBalance(user_id: 1)
  }
  ```

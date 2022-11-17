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
JWT_SECRET=""
FLASK_HOST=""
FLASK_PORT=""
FLASK_SECRET_KEY=""
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

- **Error**\
  Port 5432 is bind to another process

  **Solution**

  ```
  # Check which process is running on port 5432
  sudo lsof -i :5432

  # Kill the process by ID
  sudo kill -9 <pid>
  ```

- **Misc**

  ```
  # Stop all Docker containers
  docker kill $(docker ps -q)

  # Remove all Docker containers
  docker rm $(docker ps -a -q)

  # Remove all Docker images
  docker rmi $(docker images -q)

  sudo rm -rf postgres redis
  ```

</br>

## API endpoints

### Query

- me
  ```
  // TODO
  ```
- users
  ```
  # Get all users
  {
    users {
      user_id
      email
      password
      wallet_balance
      date_joined
    }
  }
  ```
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

- trades
  ```
  # Get all trades
  {
    trades {
      trade_id
      user_id
      synthetic_type
      currency
      trade_time
      trade_type
      trade_result
      current_wallet_balance
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
      trade_type
      trade_result
      current_wallet_balance
    }
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
- updateUser
  ```
  # Update user details
  mutation {
      updateUser(user_id: 2, email: "newemail@icloud.com", password: "P4ssword! ", wallet_balance: 4000) {
          user_id,
          email,
          password,
          wallet_balance
      }
  }
  ```
- deleteUser
  ```
  # Delete user by user_id. This will also delete user's trades
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
  # Create new trade
  mutation {
    createTrade(user_id: 1, synthetic_type: "boom_100_rise", trade_type: "buy", trade_result: -1000.80, current_wallet_balance: 9000) {
      user_id,
      synthetic_type,
      trade_type,
      trade_result,
      current_wallet_balance,
    }
  }
  ```
- forgotPassword
  ```
  // TODO
  ```

</br>

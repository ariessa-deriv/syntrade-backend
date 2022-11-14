<h1 align="center">Syntrade Backend</h1>

<p align="center">  
📈 Syntrade Backend is a GraphQL API server built on top of Express</a>.
</p>
</br>

## Technologies Used

- [Express](https://www.npmjs.com/package/express)
- [GraphQL](https://www.npmjs.com/package/graphql)
- [SocketIO Client](https://www.npmjs.com/package/socket.io-client)

</br>

## Run It Locally

Clone repository

```
git clone git@github.com:ariessa-deriv/syntrade-backend.git
```

Create .env file and insert values

```
POSTGRES_HOST=""
POSTGRES_PORT=""
POSTGRES_DATABASE=""
POSTGRES_USER=""
POSTGRES_PASSWORD=""
REDIS_PASSWORD=""
JWT_SECRET=""
```

Build and start Docker containers in detached mode

- For development

  ```
  docker-compose --env-file .env --file docker-compose-dev.yml up -d
  ```

  Open [http://localhost:4000](http://localhost:4000) with your browser to use GraphiQL.

- For production
  ```
  docker-compose --env-file .env --file docker-compose-prod.yml up -d
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
    signup(email: "randomemail@gmail.com", password: "ABC123!") {
      email,
      password
    }
  }
  ```
- login
  ```
  # Login
  mutation {
    login(email: "randomemail@gmail.com", password: "ABC123!") {
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
    createTrade(user_id: 1, synthetic_type: "boom_100", trade_type: "buy", trade_result: -1000.80, current_wallet_balance: 9000) {
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

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

All installation instructions are geared for Ubuntu

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
BACKEND_PORT="4000"
POSTGRES_HOST="syntrade-database"
POSTGRES_PORT="5432"
POSTGRES_DATABASE="syntrade"
POSTGRES_USER="" // Replace this with your own value
POSTGRES_PASSWORD="" // Replace this with your own value
REDIS_PASSWORD="" // Replace this with your own value
REDIS_PORT="6379"
REDIS_USER="default"
JWT_SECRET="" // Replace this with your own value
FLASK_HOST="syntrade-pricing"
FLASK_PORT="5000"
FLASK_SECRET_KEY="" // Replace this with your own value
FRONTEND_DEV_URL="http://localhost:3000"
FRONTEND_URL="" // Replace this with your own value
GMAIL_USER="" // Replace this with your own value
GMAIL_PASSWORD="" // Replace this with your own value
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
 </br>
  
## Deployment

### Subdomain Configurations
This section assumes that you bought your domain name from Namecheap, using Cloudflare Content Delivery Network as Content Delivery Network, and using Digital Ocean Droplet as Virtual Private Server. This section guides you to setup two subdomains: `api.syntrade.xyz` and `pricing.syntrade.xyz`.

- Inside your Namecheap domain configuration dashboard, set your nameservers to Cloudflare nameservers.
```
Example:

beth.ns.cloudflare.com
tony.ns.cloudflare.com
```

</br>

- Inside your Digital Ocean droplet, set A records for both `api.syntrade.xyz` and `pricing.syntrade.xyz` to direct to your Digital Ocean droplet's IPv4 address.
```
Example:

Type    Hostname                  Value                           TTL               
A       api.syntrade.xyz          directs to 143.198.218.123      3600
A       pricing.syntrade.xyz      directs to 143.198.218.123      3600
```

</br>

- Inside your Cloudflare domain management, set A records for both `api.syntrade.xyz` and `pricing.syntrade.xyz` to direct to your Digital Ocean droplet's IPv4 address.
```
Example:

Type    Name                      Content              Proxy status     TTL               
A       api.syntrade.xyz          143.198.218.123      DNS only         Auto
A       pricing.syntrade.xyz      143.198.218.123      DNS only         Auto
```
</br>

### Virtual Private Server Configurations

1. Connect to your Digital Ocean droplet using SSH
```
Example:
ssh ariessa@${your-digital-ocean-droplet-ipv4-address}
```
</br>

2. Install Nginx
```
sudo apt-get install nginx
```
</br>

3. Clone repository

```
git clone git@github.com:ariessa-deriv/syntrade-backend.git
```
</br>

4. Create .env file and insert values

```
BACKEND_PORT="4000"
POSTGRES_HOST="syntrade-database"
POSTGRES_PORT="5432"
POSTGRES_DATABASE="syntrade"
POSTGRES_USER="" // Replace this with your own value
POSTGRES_PASSWORD="" // Replace this with your own value
REDIS_PASSWORD="" // Replace this with your own value
REDIS_PORT="6379"
REDIS_USER="default"
JWT_SECRET="" // Replace this with your own value
FLASK_HOST="syntrade-pricing"
FLASK_PORT="5000"
FLASK_SECRET_KEY="" // Replace this with your own value
FRONTEND_DEV_URL="http://localhost:3000"
FRONTEND_URL="" // Replace this with your own value
GMAIL_USER="" // Replace this with your own value
GMAIL_PASSWORD="" // Replace this with your own value
```
</br>

5. Build and start all Docker containers

```
sh start.sh
```
</br>

6. Create SSL certificates using manual DNS challenge for subdomains `api.syntrade.xyz` and `pricing.syntrade.xyz`
```
sudo certbot certonly --manual --preferred-challenge dns -d api.syntrade.xyz -d pricing.syntrade.xyz
```
</br>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Copy the result of manual DNS challenge for `api.syntrade.xyz` and create TXT record inside Cloudflare domain management
```
Example:

Type    Name                      Content                                           Proxy status     TTL               
TXT     _acme-challenge.api       nOi3zto26NB_XwO5zJSE2w4KHM3sdhujWGj6VuEEImo       DNS only         Auto
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Copy the result of manual DNS challenge for `pricing.syntrade.xyz` and create TXT record inside Cloudflare domain management
```
Example:

Type    Name                      Content                                           Proxy status     TTL               
TXT     _acme-challenge.pricing   nv--fKnH2GEHfw7DF8Jcq7WZMqD7siTBrw_lcVA05mA       DNS only         Auto
```

</br>

7. Store the SSL certificates inside `/etc/ssl/nginx` folder

</br>

8. Setup Nginx config file named `/etc/nginx/conf.d/local_domains.conf`. This config file attaches:
    - The Docker container named `syntrade-backend` to the subdomain `api.syntrade.xyz`.
    - The Docker container named `syntrade-pricing` to the subdomain `pricing.syntrade.xyz`.

  ```
  server {
      listen         80;
      listen         443 ssl;
      server_name    api.syntrade.xyz;
      ssl_certificate /etc/ssl/nginx/cert.pem;
      ssl_certificate_key /etc/ssl/nginx/privkey.pem;

      location / {
      set $target http://127.0.0.1:4000;
      proxy_pass $target;
    }
  }

  server {
      listen         80;
      listen         443 ssl;
      server_name    pricing.syntrade.xyz;
      ssl_certificate /etc/ssl/nginx/fullchain.pem;
      ssl_certificate_key /etc/ssl/nginx/privkey.pem;

      location / {
      set $target http://127.0.0.1:5000;
      proxy_set_header Connection '';
      proxy_http_version 1.1;
      chunked_transfer_encoding off;
      proxy_buffering off;
      proxy_cache off;
      proxy_pass $target;
    }
  }

  ```
  
  </br>

  9. Allow HTTP connections on port 80
  ```
  sudo ufw allow 80/tcp
  ```
  
  </br>

  10. Allow HTTPS connections on port 443
  ```
  sudo ufw allow 443/tcp
  ```

</br>

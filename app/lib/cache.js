const Redis = require("ioredis");
const dotenv = require("dotenv");

// Load .env file contents into process.env
dotenv.config();

const cacheClient = new Redis(
  `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@syntrade-cache:${process.env.REDIS_PORT}`
);

cacheClient.on("error", (err) => console.log("Redis Client Error", err));

cacheClient.on("connect", function () {
  console.log("Redis Client Connected!");
});

module.exports = cacheClient;

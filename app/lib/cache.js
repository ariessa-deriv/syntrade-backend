const Redis = require("ioredis");
const dotenv = require("dotenv");

// Load .env file contents into process.env
dotenv.config();

const cacheClient = new Redis(
  `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@syntrade-cache:${process.env.REDIS_PORT}`
);

cacheClient.on("error", (err) => {});

cacheClient.on("connect", () => {});

module.exports = cacheClient;

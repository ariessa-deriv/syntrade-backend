const Redis = require("ioredis");
const dotenv = require("dotenv");

// Load .env file contents into process.env
dotenv.config();

const cacheClient = new Redis(
  `redis://default:${process.env.REDIS_PASSWORD}@0.0.0.0:6379`
);

cacheClient.on("error", (err) => console.log("Redis Client Error", err));

cacheClient.connect();

cacheClient.on("connect", function () {
  console.log("Redis Client Connected!");
});

module.exports = cacheClient;

const { createClient } = require("redis");

const cacheClient = createClient();

cacheClient.on("error", (err) => console.log("Redis Client Error", err));

cacheClient.connect();

cacheClient.on("connect", function() {
  console.log("Redis Client Connected!");
});

module.exports = cacheClient;

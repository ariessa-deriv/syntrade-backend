const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load .env file contents into process.env
dotenv.config();

const databasePool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  port: process.env.POSTGRES_PORT,
});

module.exports = databasePool;

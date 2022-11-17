const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");

// Load .env file contents into process.env
dotenv.config();

var app = express();

app.use(
  "/",
  cors({ origin: process.env.FLASK_PORT, credentials: true }),
  graphqlHTTP(async (req, res, graphQLParams) => ({
    schema: schema,
    graphiql: true,
  }))
);

app.listen(4000);

const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const { io } = require("socket.io-client");
const schema = require("./graphql/schema");

// Load .env file contents into process.env
dotenv.config();

// Connect to websocket server, reconnect in case of disrupted connection
var socket = io.connect(
  `ws://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}`,
  {
    reconnect: true,
  }
);

console.log(process.env.FLASK_HOST);

// Add a connect listener
socket.on("connect", () => {
  console.log("Websocket client is connected to Websocket server"); // true
});

// Add a disconnect listener
socket.on("disconnect", () => {
  console.log("Websocket client has been disconnected from Websocket server"); // false
});

// Add a pricing listener
socket.on("pricing", function(msg) {
  console.log(JSON.parse(msg));
});

var app = express();

app.use(
  "/",
  cors({ origin: "http://localhost:3000", credentials: true }),
  graphqlHTTP(async (req, res, graphQLParams) => ({
    schema: schema,
    graphiql: true,
    // context: {
    //   SECRET,
    //   SECRET_2,
    //   user: req.user,
    //   res,
    // },
  }))
);

app.listen(parseInt(process.env.BACKEND_PORT));

console.log(
  `Running a GraphQL API server at http://localhost:${process.env.BACKEND_PORT}`
);

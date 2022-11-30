const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const Cookies = require("cookies");

// Load .env file contents into process.env
dotenv.config();

var app = express();

const getUser = async (token) => {
  // Example of JWT token structure, type JSON Web Encryption (JWE)
  // eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiSm9lIENvZGVyIn0.5dlp7GmziL2QS06sZgK4mtaqv0_xX4oFUuTDh1zHK4U
  // JOSE Header
  // {
  //   "alg": "HS256",
  //   "typ": "JWT"
  // }
  // JWS Payload
  // {
  //  id: user.user_id
  // }
  // Secret
  // thisisasecret

  console.log("token[1]", token[1]);

  // Find user by user_id
  const userToFind = await databasePool.query(
    `SELECT * FROM users WHERE user_id = '${token[1]}'`
  );

  return userToFind.rows[0];
};

const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SECRET);
  } catch {
    return null;
  }
};

app.use(
  "/",
  cors({
    origin: process.env.FRONTEND_DEV_URL,
    credentials: true,
  }),
  graphqlHTTP(async (req, res, graphQLParams) => ({
    schema: schema,
    graphiql: true,
    context: ({ req, res }) => {
      const cookies = new Cookies(req, res);
      const token = cookies.get("auth-token");
      const user = verifyToken(token);
      return {
        cookies,
        user,
      };
    },
  }))
);

app.listen(4000);

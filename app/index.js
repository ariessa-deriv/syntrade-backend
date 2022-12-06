const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const schema = require("./graphql/schema");
const EventSource = require("eventsource");
const cacheClient = require("./lib/cache");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { graphqlHTTP } = require("express-graphql");
const Cookies = require("cookies");
const bodyParser = require("body-parser");
const databasePool = require("./lib/database");
const {
  checkEmailValidity,
  checkPasswordValidity,
} = require("./lib/input_validations");
const crypto = require("crypto");

// Load .env file contents into process.env
dotenv.config();

console.log("node_env: ", process.env.NODE_ENV);

const eventSourceUrl = "https://pricing.syntrade.xyz";

const sse = new EventSource(eventSourceUrl);
sse.onmessage = async (e) => {
  try {
    const data = JSON.parse(e.data);
    console.log("data: ", data);

    // Store the prices inside a list and trim the list to 60 entries only
    await cacheClient
      .multi()
      .lpush(
        "historical_prices",
        JSON.stringify({
          boom_100: data.current_boom_100_price,
          crash_100: data.current_crash_100_price,
          volatility_10: data.current_vol_10_price,
          volatility_25: data.current_vol_25_price,
          time_utc: data.time_utc,
          time_asia_kuala_lumpur: data.time_asia_kuala_lumpur,
        })
      )
      .ltrim("historical_prices", 0, 59)
      .exec();
  } catch (error) {
    console.log("Error: ", error);
  }
};

sse.onerror = (e) => {
  console.log("Error:", e.message);
};

var app = express();
const origin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://app.syntrade.xyz";

const corsOptions = {
  origin: origin,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.post("/login", bodyParser.json(), async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  const isEmailValid = checkEmailValidity(email);
  const isPasswordValid = checkPasswordValidity(password);
  let doesEmailExists = false;

  if (isEmailValid && isPasswordValid) {
    try {
      // Find user by email address
      const findUser = await databasePool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      doesEmailExists = findUser.rowCount > 0;

      // If email address cannot be found in database, throw an  error
      if (!doesEmailExists) {
        res.status(404).send({
          success: false,
          message: `Could not find account with email: ${email}`,
        });
        return;
      } else {
        const userId = findUser.rows[0]["user_id"];
        const salt = findUser.rows[0].salt;
        const hash = findUser.rows[0].hash;
        const inputHash = crypto
          .pbkdf2Sync(password, salt, 1000, 64, "sha512")
          .toString("hex");
        const passwordsMatch = hash === inputHash;

        // If passwords don't match, throw an authentication error
        if (!passwordsMatch) {
          res.status(401).send({
            success: false,
            message: "Incorrect password",
          });
          return;
        } else {
          // Create JWT
          const token = jwt.sign(
            {
              userId: userId,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "8h",
            }
          );

          res.cookie("auth-token", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "development" ? false : true,
            // Production
            // domain: ".syntrade.xyz", // set your domain
          });

          res.send({
            success: true,
          });
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }
});

app.post("/logout", async (req, res) => {
  res.cookie("auth-token", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "development" ? false : true,
    // Production
    // domain: ".syntrade.xyz",
  });

  res.send({
    success: true,
  });
});

app.use(
  "/",
  graphqlHTTP((req, res, graphQLParams) => ({
    schema: schema,
    graphiql: false,
    context: {
      token: req.cookies["auth-token"],
    },
  }))
);

app.listen(4000);

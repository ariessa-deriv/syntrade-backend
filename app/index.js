const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const EventSource = require("eventsource");
const cacheClient = require("./lib/cache");

// Load .env file contents into process.env
dotenv.config();

const sse = new EventSource(`http://0.0.0.0:5000`);
sse.onmessage = async (e) => {
  try {
    const data = JSON.parse(e.data);

    // Cache the prices into their respective historical lists
    await cacheClient
      .multi()
      .lpush(
        "historical_boom_100",
        JSON.stringify({
          value: data.current_boom_100_price,
          time: data.time_utc,
        })
      )
      .lpush(
        "historical_boom_300",
        JSON.stringify({
          value: data.current_boom_300_price,
          time: data.time_utc,
        })
      )
      .lpush(
        "historical_boom_500",
        JSON.stringify({
          value: data.current_boom_500_price,
          time: data.time_utc,
        })
      )
      .lpush(
        "historical_crash_100",
        JSON.stringify({
          value: data.current_crash_100_price,
          time: data.time_utc,
        })
      )
      .lpush(
        "historical_crash_300",
        JSON.stringify({
          value: data.current_crash_300_price,
          time: data.time_utc,
        })
      )
      .lpush(
        "historical_crash_500",
        JSON.stringify({
          value: data.current_crash_500_price,
          time: data.time_utc,
        })
      )
      .lpush(
        "historical_volatility_10",
        JSON.stringify({
          value: data.current_volatility_10_price,
          time: data.time_utc,
        })
      )
      .lpush(
        "historical_volatility_25",
        JSON.stringify({
          value: data.current_volatility_25_price,
          time: data.time_utc,
        })
      )
      .exec();

    // Trim the prices list to 100 entries only
    await cacheClient
      .multi()
      .ltrim("historical_boom_100", 0, 99)
      .ltrim("historical_boom_300", 0, 99)
      .ltrim("historical_boom_500", 0, 99)
      .ltrim("historical_crash_100", 0, 99)
      .ltrim("historical_crash_300", 0, 99)
      .ltrim("historical_crash_500", 0, 99)
      .ltrim("historical_volatility_10", 0, 99)
      .ltrim("historical_volatility_25", 0, 99)
      .exec();

    // await cacheClient.publish("pricing", JSON.stringify(JSON.parse(e.data)));
  } catch (error) {
    console.log("Error: ", error);
  }
};

sse.onerror = (e) => {
  console.log("Error:", e.message);
};

var app = express();

app.use(
  "/",
  cors({ origin: "https://app.syntrade.xyz", credentials: true }),
  graphqlHTTP(async (req, res, graphQLParams) => ({
    schema: schema,
    graphiql: false,
    // context: {
    //   SECRET,
    //   SECRET_2,
    //   user: req.user,
    //   res,
    // },
  }))
);

app.listen(4000);

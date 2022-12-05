const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");
const { resolvers: scalarResolvers } = require("graphql-scalars");
const User = require("./object/user");
const Trade = require("./object/trade");
const databasePool = require("../lib/database");
const {
  boom100_stake,
  crash100_stake,
  matches_differs_stake,
  boom100_payout,
  crash100_payout,
  even_odd_payout,
  even_odd_stake,
  matches_differs_payout,
  vol_rise_fall_payout,
  vol_rise_fall_stake,
} = require("../lib/pricing");
const jwt = require("jsonwebtoken");

const query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    tradesByUserId: {
      type: GraphQLList(Trade),
      resolve: async (parent, args, context, resolveInfo) => {
        const userId = jwt.decode(context.token).userId;
        const isUserIdValid =
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i.test(
            userId
          );

        if (isUserIdValid) {
          try {
            const test = await databasePool.query(
              `SELECT * FROM trades WHERE trades.user_id = $1;`,
              [userId]
            );

            console.log("test: ", test);
            console.log("test.rows: ", test.rows);
            return (
              await databasePool.query(
                `SELECT * FROM trades WHERE trades.user_id = $1;`,
                [userId]
              )
            ).rows;
          } catch (err) {
            throw new Error("Failed to get trade by user_id");
          }
        }
      },
    },

    prices: {
      type: GraphQLList(GraphQLFloat),
      args: {
        wagerType: { type: GraphQLNonNull(GraphQLString) },
        syntheticModel: { type: GraphQLNonNull(GraphQLString) },
        tradeType: { type: GraphQLNonNull(GraphQLString) },
        wagerAmount: { type: GraphQLNonNull(GraphQLFloat) },
        ticks: { type: GraphQLInt },
      },
      resolve: (parent, args, context, resolveInfo) => {
        const validSyntheticModel = [
          "boom_100",
          "crash_100",
          "volatility_10",
          "volatility_25",
        ];
        const validTradeType = ["rise_fall", "even_odd", "matches_differs"];
        const wagerType = args.wagerType.toLowerCase();
        const syntheticModel = args.syntheticModel.toLowerCase();
        const tradeType = args.tradeType.toLowerCase();
        const wagerAmount = args.wagerAmount;
        const ticks = args.ticks || 0;
        const isWagerTypeValid = wagerType == "stake" || wagerType == "payout";
        const isSyntheticModelValid =
          validSyntheticModel.includes(syntheticModel);
        const isTradeTypeValid = validTradeType.includes(tradeType);
        const isWagerAmountValid =
          (wagerType == "stake" && wagerAmount >= 1.0) ||
          (wagerType == "payout" && wagerAmount < 30000.0);
        const isTicksValid = ticks >= 1 && ticks <= 10;

        console.log("\nwagerType: ", wagerType);
        console.log("isWagerTypeValid: ", isWagerTypeValid);
        console.log("syntheticModel: ", syntheticModel);
        console.log("isSyntheticModelValid: ", isSyntheticModelValid);
        console.log("tradeType: ", tradeType);
        console.log("isTradeTypeValid: ", isTradeTypeValid);
        console.log("wagerAmount: ", wagerAmount);
        console.log("isWagerAmountValid: ", isWagerAmountValid);
        console.log("ticks: ", ticks);
        console.log("isTicksValid: ", isTicksValid);

        if (
          isWagerTypeValid &&
          isSyntheticModelValid &&
          isTradeTypeValid &&
          isWagerAmountValid &&
          isTicksValid
        ) {
          if (wagerType == "stake") {
            if (syntheticModel == "boom_100" && tradeType == "rise_fall") {
              return boom100_payout(wagerAmount, ticks);
            } else if (
              syntheticModel == "crash_100" &&
              tradeType == "rise_fall"
            ) {
              return crash100_payout(wagerAmount, ticks);
            } else if (
              syntheticModel == "volatility_10" &&
              tradeType == "even_odd"
            ) {
              return even_odd_payout(wagerAmount);
            } else if (
              syntheticModel == "volatility_25" &&
              tradeType == "even_odd"
            ) {
              return even_odd_payout(wagerAmount);
            } else if (
              syntheticModel == "volatility_10" &&
              tradeType == "matches_differs"
            ) {
              return matches_differs_payout(wagerAmount);
            } else if (
              syntheticModel == "volatility_25" &&
              tradeType == "matches_differs"
            ) {
              return matches_differs_payout(wagerAmount);
            } else if (
              syntheticModel == "volatility_10" &&
              tradeType == "rise_fall"
            ) {
              return vol_rise_fall_payout(wagerAmount, 10, ticks);
            } else if (
              syntheticModel == "volatility_25" &&
              tradeType == "rise_fall"
            ) {
              return vol_rise_fall_payout(wagerAmount, 25, ticks);
            }
          } else {
            if (syntheticModel == "boom_100" && tradeType == "rise_fall") {
              return boom100_stake(wagerAmount, ticks);
            } else if (
              syntheticModel == "crash_100" &&
              tradeType == "rise_fall"
            ) {
              return crash100_stake(wagerAmount, ticks);
            } else if (
              syntheticModel == "volatility_10" &&
              tradeType == "even_odd"
            ) {
              return even_odd_stake(wagerAmount);
            } else if (
              syntheticModel == "volatility_25" &&
              tradeType == "even_odd"
            ) {
              return even_odd_stake(wagerAmount);
            } else if (
              syntheticModel == "volatility_10" &&
              tradeType == "matches_differs"
            ) {
              return matches_differs_stake(wagerAmount);
            } else if (
              syntheticModel == "volatility_25" &&
              tradeType == "matches_differs"
            ) {
              return matches_differs_stake(wagerAmount);
            } else if (
              syntheticModel == "volatility_10" &&
              tradeType == "rise_fall"
            ) {
              return vol_rise_fall_stake(wagerAmount, 10, ticks);
            } else if (
              syntheticModel == "volatility_25" &&
              tradeType == "rise_fall"
            ) {
              return vol_rise_fall_stake(wagerAmount, 25, ticks);
            }
          }
        }
      },
    },

    currentBalance: {
      type: GraphQLFloat,
      resolve: async (parent, args, context, resolveInfo) => {
        const userId = args.userId;
        const isUserIdValid =
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i.test(
            userId
          );

        if (isUserIdValid) {
          try {
            return (
              await databasePool.query(
                `SELECT wallet_balance FROM users WHERE users.user_id = $1;`,
                [userId]
              )
            ).rows[0].wallet_balance;
          } catch (err) {
            throw new Error("Failed to get user's wallet balance");
          }
        }
      },
    },
  }),
});

module.exports = query;

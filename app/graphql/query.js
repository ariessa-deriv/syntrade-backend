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
  match_differs_stake,
  boom100_payout,
  crash100_payout,
  even_odd_payout,
  even_odd_stake,
  match_differs_payout,
  vol_rise_fall_payout,
  vol_rise_fall_stake,
} = require("../lib/pricing");

const query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    user: {
      type: User,
      args: { user_id: { type: GraphQLNonNull(GraphQLInt) } },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await databasePool.query(
              `SELECT * FROM users WHERE user_id = $1;`,
              [args.user_id]
            )
          ).rows[0];
        } catch (err) {
          throw new Error("Failed to get user by user_id");
        }
      },
    },

    trade: {
      type: Trade,
      args: { trade_id: { type: GraphQLNonNull(GraphQLInt) } },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await databasePool.query(
              `SELECT * FROM trades WHERE trades.trade_id = $1;`,
              [args.trade_id]
            )
          ).rows[0];
        } catch (err) {
          throw new Error("Failed to get trade by trade_id");
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
      resolve: async (parent, args, context, resolveInfo) => {
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

        console.log("wagerType: ", wagerType);
        console.log("isWagerTypeValid: ", isWagerTypeValid);
        console.log("syntheticModel: ", syntheticModel);
        console.log("isSyntheticModelValid: ", isSyntheticModelValid);
        console.log("tradeType: ", tradeType);
        console.log("isTradeTypeValid: ", isTradeTypeValid);
        console.log("wagerAmount: ", wagerAmount);
        console.log("isWagerAmountValid: ", isWagerAmountValid);
        console.log("ticks: ", ticks);
        console.log("isTicksValid: ", isTicksValid);

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
            return match_differs_payout(wagerAmount);
          } else if (
            syntheticModel == "volatility_25" &&
            tradeType == "matches_differs"
          ) {
            return match_differs_payout(wagerAmount);
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
            return match_differs_stake(wagerAmount);
          } else if (
            syntheticModel == "volatility_25" &&
            tradeType == "matches_differs"
          ) {
            return match_differs_stake(wagerAmount);
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
      },
    },

    currentBalance: {
      type: GraphQLFloat,
      args: { user_id: { type: GraphQLNonNull(GraphQLInt) } },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await databasePool.query(
              `SELECT wallet_balance FROM users WHERE users.user_id = $1;`,
              [args.user_id]
            )
          ).rows[0].wallet_balance;
        } catch (err) {
          throw new Error("Failed to get user's wallet balance");
        }
      },
    },
  }),
});

module.exports = query;

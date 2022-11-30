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
      type: new GraphQLList(GraphQLFloat),
      args: {
        type: { type: new GraphQLNonNull(GraphQLBoolean) },
        syntheticModel: { type: new GraphQLNonNull(GraphQLString) },
        tradeType: { type: GraphQLNonNull(GraphQLString) },
        stake: { type: new GraphQLNonNull(GraphQLFloat) },
        ticks: { type: GraphQLInt },
        numberPrediction: { type: GraphQLInt },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        const type = args.type;
        const syntheticModel = args.syntheticModel;
        const tradeType = args.tradeType;
        const stake = args.stake;
        const ticks = args.ticks || 0;
        const numberPrediction = args.numberPrediction || 0;

        console.log("type: ", type);
        console.log("syntheticModel: ", syntheticModel);
        console.log("tradeType: ", tradeType);
        console.log("stake: ", stake);
        console.log("ticks: ", ticks);
        console.log("numberPrediction: ", numberPrediction);

        if (!type) {
          if (syntheticModel == "boom_100" && tradeType == "rise_fall") {
            return boom100_payout(stake, ticks);
          } else if (
            syntheticModel == "crash_100" &&
            tradeType == "rise_fall"
          ) {
            return crash100_payout(stake, ticks);
          } else if (
            syntheticModel == "volatility_10" &&
            tradeType == "even_odd"
          ) {
            return even_odd_payout(stake);
          } else if (
            syntheticModel == "volatility_25" &&
            tradeType == "even_odd"
          ) {
            return even_odd_payout(stake);
          } else if (
            syntheticModel == "volatility_10" &&
            tradeType == "matches_differs"
          ) {
            return match_differs_payout(stake);
          } else if (
            syntheticModel == "volatility_25" &&
            tradeType == "matches_differs"
          ) {
            return match_differs_payout(stake);
          } else if (
            syntheticModel == "volatility_10" &&
            tradeType == "rise_fall"
          ) {
            return vol_rise_fall_payout(stake, 10, ticks);
          } else if (
            syntheticModel == "volatility_25" &&
            tradeType == "rise_fall"
          ) {
            return vol_rise_fall_payout(stake, 25, ticks);
          }
        } else {
          if (syntheticModel == "boom_100" && tradeType == "rise_fall") {
            return boom100_stake(stake, ticks);
          } else if (
            syntheticModel == "crash_100" &&
            tradeType == "rise_fall"
          ) {
            return crash100_stake(stake, ticks);
          } else if (
            syntheticModel == "volatility_10" &&
            tradeType == "even_odd"
          ) {
            return even_odd_stake(stake);
          } else if (
            syntheticModel == "volatility_25" &&
            tradeType == "even_odd"
          ) {
            return even_odd_stake(stake);
          } else if (
            syntheticModel == "volatility_10" &&
            tradeType == "matches_differs"
          ) {
            return match_differs_stake(stake);
          } else if (
            syntheticModel == "volatility_25" &&
            tradeType == "matches_differs"
          ) {
            return match_differs_stake(stake);
          } else if (
            syntheticModel == "volatility_10" &&
            tradeType == "rise_fall"
          ) {
            return vol_rise_fall_stake(stake, 10, ticks);
          } else if (
            syntheticModel == "volatility_25" &&
            tradeType == "rise_fall"
          ) {
            return vol_rise_fall_stake(stake, 25, ticks);
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

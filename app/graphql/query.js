const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");
const { resolvers: scalarResolvers } = require("graphql-scalars");
const User = require("./object/user");
const Trade = require("./object/trade");
const databasePool = require("../lib/database");

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
  }),
});

module.exports = query;

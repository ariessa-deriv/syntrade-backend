const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");
const User = require("./object/user");
const Trade = require("./object/trade");
const databasePool = require("../lib/database");

const query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    // TODO: me
    me: {
      type: User,
      resolve: (parent, args, context, resolveInfo) => {},
    },
    users: {
      type: new GraphQLList(User),
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await databasePool.query(
              `SELECT users.*, (select row_to_json(t) from (select * from trades where trades.user_id = users.user_id) as t) as trades FROM users INNER JOIN trades ON users.user_id = trades.user_id;`
            )
          ).rows;
        } catch (err) {
          throw new Error("Failed to get all users");
        }
      },
    },
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
    trades: {
      type: new GraphQLList(Trade),
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await databasePool.query(`SELECT * FROM trades;`)).rows;
        } catch (err) {
          throw new Error("Failed to get trade by trade_id");
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

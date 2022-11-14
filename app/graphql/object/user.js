const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFloat } = require("graphql");
const { resolvers: scalarResolvers } = require("graphql-scalars");
const joinMonster = require("join-monster");
const Trade = require("./trade");

const User = new GraphQLObjectType({
  name: "User",
  extensions: { joinMonster: { sqlTable: "users", uniqueKey: "user_id" } },
  fields: () => ({
    user_id: { type: GraphQLInt },
    email: { type: scalarResolvers.EmailAddress },
    password: { type: GraphQLString },
    wallet_balance: { type: GraphQLFloat, defaultValue: 10000.0 },
    date_joined: { type: scalarResolvers.BigInt },
    trades: {
      type: Trade,
      sqlJoin: (userTable, tradeTable, args) =>
        `${userTable}.user_id = ${tradeTable}.user_id`,
    },
  }),
});

module.exports = User;

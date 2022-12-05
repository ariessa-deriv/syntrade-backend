const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} = require("graphql");
const { resolvers: scalarResolvers } = require("graphql-scalars");
const Trade = require("./trade");

const User = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    user_id: { type: scalarResolvers.UUID },
    email: { type: scalarResolvers.EmailAddress },
    salt: { type: GraphQLString },
    hash: { type: GraphQLString },
    wallet_balance: { type: GraphQLFloat, defaultValue: 10000.0 },
    date_joined: { type: scalarResolvers.BigInt },
    trades: {
      type: new GraphQLList(Trade),
    },
  }),
});

module.exports = User;

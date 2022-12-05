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
    userId: { type: scalarResolvers.UUID },
    email: { type: scalarResolvers.EmailAddress },
    salt: { type: GraphQLString },
    hash: { type: GraphQLString },
    walletBalance: { type: GraphQLFloat, defaultValue: 10000.0 },
    dateJoined: { type: scalarResolvers.BigInt },
    trades: {
      type: new GraphQLList(Trade),
    },
  }),
});

module.exports = User;

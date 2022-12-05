const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
} = require("graphql");
const SyntheticEnum = require("../enum/synthetic");
const TransactionEnum = require("../enum/transaction");
const { resolvers: scalarResolvers } = require("graphql-scalars");

const Trade = new GraphQLObjectType({
  name: "Trade",
  fields: () => ({
    tradeId: { type: GraphQLInt },
    userId: { type: scalarResolvers.UUID },
    syntheticType: { type: SyntheticEnum },
    currency: { type: scalarResolvers.Currency, defaultValue: "usd" },
    tradeTime: { type: scalarResolvers.BigInt },
    transactionType: { type: TransactionEnum },
    tradeResult: { type: GraphQLFloat },
    currentWalletBalance: { type: GraphQLFloat },
    ticks: { type: GraphQLInt },
  }),
});

module.exports = Trade;

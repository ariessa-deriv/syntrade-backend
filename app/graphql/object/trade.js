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
    trade_id: { type: GraphQLInt },
    user_id: { type: GraphQLInt },
    synthetic_type: { type: SyntheticEnum },
    currency: { type: scalarResolvers.Currency, defaultValue: "usd" },
    trade_time: { type: scalarResolvers.BigInt },
    transaction_type: { type: TransactionEnum },
    trade_result: { type: GraphQLFloat },
    current_wallet_balance: { type: GraphQLFloat },
  }),
});

module.exports = Trade;

const { GraphQLEnumType } = require("graphql");

const TransactionEnum = new GraphQLEnumType({
  name: "TransactionEnum",
  values: {
    buy: {
      value: "buy",
    },
    sell: {
      value: "sell",
    },
  },
});

module.exports = TransactionEnum;

const { GraphQLEnumType } = require("graphql");

const TradeEnum = new GraphQLEnumType({
  name: "TradeEnum",
  values: {
    buy: {
      value: "buy",
    },
    sell: {
      value: "sell",
    },
  },
});

module.exports = TradeEnum;

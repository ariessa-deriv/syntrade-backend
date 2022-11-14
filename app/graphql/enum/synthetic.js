const { GraphQLEnumType } = require("graphql");

const SyntheticEnum = new GraphQLEnumType({
  name: "SyntheticEnum",
  values: {
    boom_100: {
      value: "boom_100",
    },
    boom_300: {
      value: "boom_300",
    },
    boom_500: {
      value: "boom_500",
    },
    crash_100: {
      value: "crash_100",
    },
    crash_300: {
      value: "crash_300",
    },
    crash_500: {
      value: "crash_500",
    },
    volatility_10: {
      value: "volatility_10",
    },
    volatility_25: {
      value: "volatility_25",
    },
  },
});

module.exports = SyntheticEnum;

const { GraphQLEnumType } = require("graphql");

const SyntheticEnum = new GraphQLEnumType({
  name: "SyntheticEnum",
  values: {
    boom_100_rise: {
      value: "boom_100_rise",
    },
    boom_100_fall: {
      value: "boom_100_fall",
    },
    crash_100_rise: {
      value: "crash_100_rise",
    },
    crash_100_fall: {
      value: "crash_100_fall",
    },
    volatility_10_even: {
      value: "volatility_10_even",
    },
    volatility_10_odd: {
      value: "volatility_10_odd",
    },
    volatility_10_matches: {
      value: "volatility_10_matches",
    },
    volatility_10_differs: {
      value: "volatility_10_differs",
    },
    volatility_10_rise: {
      value: "volatility_10_rise",
    },
    volatility_10_fall: {
      value: "volatility_10_fall",
    },
    volatility_25_even: {
      value: "volatility_25_even",
    },
    volatility_25_odd: {
      value: "volatility_25_odd",
    },
    volatility_25_matches: {
      value: "volatility_25_matches",
    },
    volatility_25_differs: {
      value: "volatility_25_differs",
    },
    volatility_25_rise: {
      value: "volatility_25_rise",
    },
    volatility_25_fall: {
      value: "volatility_25_fall",
    },
  },
});

module.exports = SyntheticEnum;

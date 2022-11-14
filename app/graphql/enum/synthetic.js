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
    boom_100_multiplier_50_up: {
      value: "boom_100_multiplier_50_up",
    },
    boom_100_multiplier_50_down: {
      value: "boom_100_multiplier_50_down",
    },
    boom_100_multiplier_100_up: {
      value: "boom_100_multiplier_100_up",
    },
    boom_100_multiplier_100_down: {
      value: "boom_100_multiplier_100_down",
    },
    boom_100_multiplier_200_up: {
      value: "boom_100_multiplier_200_up",
    },
    boom_100_multiplier_200_down: {
      value: "boom_100_multiplier_200_down",
    },
    boom_100_multiplier_300_up: {
      value: "boom_100_multiplier_300_up",
    },
    boom_100_multiplier_300_down: {
      value: "boom_100_multiplier_300_down",
    },
    crash_100_rise: {
      value: "crash_100_rise",
    },
    crash_100_fall: {
      value: "crash_100_fall",
    },
    crash_100_multiplier_50_up: {
      value: "crash_100_multiplier_50_up",
    },
    crash_100_multiplier_50_down: {
      value: "crash_100_multiplier_50_down",
    },
    crash_100_multiplier_100_up: {
      value: "crash_100_multiplier_100_up",
    },
    crash_100_multiplier_100_down: {
      value: "crash_100_multiplier_100_down",
    },
    crash_100_multiplier_200_up: {
      value: "crash_100_multiplier_200_up",
    },
    crash_100_multiplier_200_down: {
      value: "crash_100_multiplier_200_down",
    },
    crash_100_multiplier_300_up: {
      value: "crash_100_multiplier_300_up",
    },
    crash_100_multiplier_300_down: {
      value: "crash_100_multiplier_300_down",
    },
    boom_300_multiplier_50_up: {
      value: "boom_300_multiplier_50_up",
    },
    boom_300_multiplier_50_down: {
      value: "boom_300_multiplier_50_down",
    },
    boom_300_multiplier_100_up: {
      value: "boom_300_multiplier_100_up",
    },
    boom_300_multiplier_100_down: {
      value: "boom_300_multiplier_100_down",
    },
    boom_300_multiplier_200_up: {
      value: "boom_300_multiplier_200_up",
    },
    boom_300_multiplier_200_down: {
      value: "boom_300_multiplier_200_down",
    },
    boom_300_multiplier_300_up: {
      value: "boom_300_multiplier_300_up",
    },
    boom_300_multiplier_300_down: {
      value: "boom_300_multiplier_300_down",
    },
    boom_500_multiplier_50_up: {
      value: "boom_500_multiplier_50_up",
    },
    boom_500_multiplier_50_down: {
      value: "boom_500_multiplier_50_down",
    },
    boom_500_multiplier_100_up: {
      value: "boom_500_multiplier_100_up",
    },
    boom_500_multiplier_100_down: {
      value: "boom_500_multiplier_100_down",
    },
    boom_500_multiplier_200_up: {
      value: "boom_500_multiplier_200_up",
    },
    boom_500_multiplier_200_down: {
      value: "boom_500_multiplier_200_down",
    },
    boom_500_multiplier_300_up: {
      value: "boom_500_multiplier_300_up",
    },
    boom_500_multiplier_300_down: {
      value: "boom_500_multiplier_300_down",
    },
    crash_300_multiplier_50_up: {
      value: "crash_300_multiplier_50_up",
    },
    crash_300_multiplier_50_down: {
      value: "crash_300_multiplier_50_down",
    },
    crash_300_multiplier_100_up: {
      value: "crash_300_multiplier_100_up",
    },
    crash_300_multiplier_100_down: {
      value: "crash_300_multiplier_100_down",
    },
    crash_300_multiplier_200_up: {
      value: "crash_300_multiplier_200_up",
    },
    crash_300_multiplier_200_down: {
      value: "crash_300_multiplier_200_down",
    },
    crash_300_multiplier_300_up: {
      value: "crash_300_multiplier_300_up",
    },
    crash_300_multiplier_300_down: {
      value: "crash_300_multiplier_300_down",
    },
    crash_500_multiplier_50_up: {
      value: "crash_500_multiplier_50_up",
    },
    crash_500_multiplier_50_down: {
      value: "crash_500_multiplier_50_down",
    },
    crash_500_multiplier_100_up: {
      value: "crash_500_multiplier_100_up",
    },
    crash_500_multiplier_100_down: {
      value: "crash_500_multiplier_100_down",
    },
    crash_500_multiplier_200_up: {
      value: "crash_500_multiplier_200_up",
    },
    crash_500_multiplier_200_down: {
      value: "crash_500_multiplier_200_down",
    },
    crash_500_multiplier_300_up: {
      value: "crash_500_multiplier_300_up",
    },
    crash_500_multiplier_300_down: {
      value: "crash_500_multiplier_300_down",
    },
    volatility_10_multiplier_100_up: {
      value: "volatility_10_multiplier_100_up",
    },
    volatility_10_multiplier_100_down: {
      value: "volatility_10_multiplier_100_down",
    },
    volatility_10_multiplier_300_up: {
      value: "volatility_10_multiplier_300_up",
    },
    volatility_10_multiplier_300_down: {
      value: "volatility_10_multiplier_300_down",
    },
    volatility_10_multiplier_500_up: {
      value: "volatility_10_multiplier_500_up",
    },
    volatility_10_multiplier_500_down: {
      value: "volatility_10_multiplier_500_down",
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
    volatility_25_multiplier_100_up: {
      value: "volatility_25_multiplier_100_up",
    },
    volatility_25_multiplier_100_down: {
      value: "volatility_25_multiplier_100_down",
    },
    volatility_25_multiplier_300_up: {
      value: "volatility_25_multiplier_300_up",
    },
    volatility_25_multiplier_300_down: {
      value: "volatility_25_multiplier_300_down",
    },
    volatility_25_multiplier_500_up: {
      value: "volatility_25_multiplier_500_up",
    },
    volatility_25_multiplier_500_down: {
      value: "volatility_25_multiplier_500_down",
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
  },
});

module.exports = SyntheticEnum;

const { erf } = require("mathjs");

function cdfNormal(x, mean, standardDeviation) {
  return (1 - erf((mean - x) / (Math.sqrt(2) * standardDeviation))) / 2;
}

function bs_binary_option(St, K, sigma, delta_t, r, d, option_type) {
  var d_1, d_2;
  d_1 =
    (Math.log(St / K) + (r - d + Math.pow(sigma, 2) / 2) * delta_t) /
    (sigma * Math.sqrt(delta_t));
  d_2 = d_1 - sigma * Math.sqrt(delta_t);

  if (option_type === "call") {
    return cdfNormal(d_2, 0, 1) * Math.exp(-r * delta_t);
  } else {
    if (option_type === "put") {
      return cdfNormal(-d_2, 0, 1) * Math.exp(-r * delta_t);
    } else {
      throw new NotImplementedError("Supported option types: 'call', 'put'");
    }
  }
}

bs_binary_option(100, 100, 10, 10 / (60 * 60 * 24 * 365), 0, 0, "call");

function vol_rise_fall_payout(stake, vol, ticks) {
  var comm,
    fall_contract_unit_price,
    fall_num_contracts,
    fall_payout,
    rise_contract_unit_price,
    rise_num_contracts,
    rise_payout;
  comm = 0.012;

  if (stake >= 1) {
    rise_contract_unit_price =
      bs_binary_option(
        100000,
        100000,
        vol / 100,
        ticks / (60 * 60 * 24 * 365),
        0,
        0,
        "call"
      ) + comm;
    rise_num_contracts = stake / rise_contract_unit_price;
    rise_payout = 1 * rise_num_contracts;
    fall_contract_unit_price =
      bs_binary_option(
        100000,
        100000,
        vol / 100,
        ticks / (60 * 60 * 24 * 365),
        0,
        0,
        "put"
      ) + comm;
    fall_num_contracts = stake / fall_contract_unit_price;
    fall_payout = 1 * fall_num_contracts;
    console.log([rise_payout, fall_payout]);
    return [rise_payout, fall_payout];
  } else {
    throw new NotImplementedError("Stake needs to be greater or equal to 1");
  }
}

vol_rise_fall_payout(10, 10, 5);

function vol_rise_fall_stake(payout, vol, ticks) {
  var comm, fall_stake, rise_stake;
  comm = 0.012;
  rise_stake =
    (bs_binary_option(
      100000,
      100000,
      vol / 100,
      ticks / (60 * 60 * 24 * 365),
      0,
      0,
      "call"
    ) +
      comm) *
    payout;
  fall_stake =
    (bs_binary_option(
      100000,
      100000,
      vol / 100,
      ticks / (60 * 60 * 24 * 365),
      0,
      0,
      "put"
    ) +
      comm) *
    payout;

  if (rise_stake >= 1 && fall_stake >= 1) {
    console.log([rise_stake, fall_stake]);
    return [rise_stake, fall_stake];
  }

  if (rise_stake < 1 && fall_stake >= 1) {
    return [null, fall_stake];
  }

  if (rise_stake >= 1 && fall_stake < 1) {
    return [rise_stake, null];
  } else {
    return "Stake is too low";
  }
}

vol_rise_fall_stake(10, 10, 5); //Expect 5.12 for both

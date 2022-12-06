const { erf } = require("mathjs");

function factorial(n) {
  if (n == 0 || n == 1) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

const boom100_payout = (stake, ticks) => {
  var S,
    S0,
    call_contract_unit_price,
    call_num_contracts,
    call_payoff,
    call_payout,
    comm,
    d,
    node_prob,
    put_contract_unit_price,
    put_num_contracts,
    put_payoff,
    put_payout,
    u,
    win_prob;
  u = 0.01;
  d = 1 - u;
  call_payoff = 0;
  put_payoff = 0;
  S0 = 100000;
  win_prob = 0;
  comm = 0.015;
  diff = 0;

  for (var i = 0, _pj_a = ticks + 1; i < _pj_a; i += 1) {
    node_prob =
      (factorial(ticks) / (factorial(ticks - i) * factorial(i))) *
      Math.pow(u, ticks - i) *
      Math.pow(1 - u, i);
    S = S0 + 99 * (ticks - i) - i;

    if (S - S0 > diff) {
      call_payoff += node_prob;
      put_payoff = put_payoff;
    } else {
      put_payoff += node_prob;
      call_payoff = call_payoff;
    }
  }

  call_contract_unit_price = call_payoff + comm;
  call_num_contracts = stake / call_contract_unit_price;
  call_payout = call_num_contracts;
  put_contract_unit_price = put_payoff + comm;
  put_num_contracts = stake / put_contract_unit_price;
  put_payout = put_num_contracts;

  if (put_payout > stake && call_payout > stake) {
    // console.log([call_payout, put_payout]);
    return [call_payout, put_payout];
  }

  if (put_payout > stake && call_payout <= stake) {
    // console.log([null, put_payout]);
    return [null, put_payout];
  }

  if (put_payout <= stake && call_payout > stake) {
    // console.log([call_payout, null]);
    return [call_payout, null];
  } else {
    // console.log("Contract is not offered");
    return [null, null];
  }
};

const boom100_stake = (payout, ticks) => {
  var S,
    S0,
    call_prob,
    call_stake,
    comm,
    d,
    node_prob,
    payoff,
    put_prob,
    put_stake,
    u;
  u = 0.01;
  d = 1 - u;
  payoff = 0;
  S0 = 100000;
  call_prob = 0;
  put_prob = 0;
  comm = 0.015;
  diff = 0;

  for (var i = 0, _pj_a = ticks + 1; i < _pj_a; i += 1) {
    node_prob =
      (factorial(ticks) / (factorial(ticks - i) * factorial(i))) *
      Math.pow(u, ticks - i) *
      Math.pow(1 - u, i);
    S = S0 + 99 * (ticks - i) - i;

    if (S - S0 > diff) {
      call_prob += node_prob;
      put_prob = put_prob;
    } else {
      call_prob = call_prob;
      put_prob += node_prob;
    }
  }

  call_stake = payout * (call_prob + comm);
  put_stake = payout * (put_prob + comm);

  if (payout > call_stake && payout > put_stake) {
    // console.log([call_stake, put_stake]);
    return [call_stake, put_stake];
  }

  if (payout > call_stake && payout <= put_stake) {
    // console.log([call_stake, null]);
    return [call_stake, null];
  }

  if (payout <= call_stake && payout > put_stake) {
    // console.log([null, put_stake]);
    return [null, put_stake];
  } else {
    // console.log("Contract is not offered");
    return [null, null];
  }
};

const boom100_winnings = (
  entry_price,
  exit_price,
  stake,
  ticks,
  option_type
) => {
  var winnings;

  if (option_type === "call") {
    if (exit_price > entry_price) {
      winnings = boom100_payout(stake, ticks)[0];
    } else {
      winnings = stake * -1;
    }
  } else {
    if (option_type === "put") {
      if (exit_price < entry_price) {
        winnings = boom100_payout(stake, ticks)[1];
      } else {
        winnings = stake * -1;
      }
    } else {
      throw new NotImplementedError("Supported option types: 'call', 'put'");
    }
  }
  // console.log(winnings);
  return winnings;
};

// boom100_winnings(900, 910, 10, 5, "call");
// boom100_winnings(900, 910, 10, 5, "put");
// boom100_winnings(900, 890, 10, 5, "call");
// boom100_winnings(900, 890, 10, 5, "put");

const crash100_payout = (stake, ticks) => {
  var S,
    S0,
    call_contract_unit_price,
    call_num_contracts,
    call_payoff,
    call_payout,
    comm,
    d,
    node_prob,
    put_contract_unit_price,
    put_num_contracts,
    put_payoff,
    put_payout,
    u,
    win_prob;
  u = 0.01;
  d = 1 - u;
  call_payoff = 0;
  put_payoff = 0;
  S0 = 100000;
  win_prob = 0;
  comm = 0.015;
  diff = 0;

  for (var i = 0, _pj_a = ticks + 1; i < _pj_a; i += 1) {
    node_prob =
      (factorial(ticks) / (factorial(ticks - i) * factorial(i))) *
      Math.pow(u, ticks - i) *
      Math.pow(1 - u, i);
    S = S0 - 99 * (ticks - i) + i;

    if (S - S0 > diff) {
      call_payoff += node_prob;
      put_payoff = put_payoff;
    } else {
      put_payoff += node_prob;
      call_payoff = call_payoff;
    }
  }

  call_contract_unit_price = call_payoff + comm;
  call_num_contracts = stake / call_contract_unit_price;
  call_payout = call_num_contracts;
  put_contract_unit_price = put_payoff + comm;
  put_num_contracts = stake / put_contract_unit_price;
  put_payout = put_num_contracts;

  if (put_payout > stake && call_payout > stake) {
    // console.log([call_payout, put_payout]);
    return [call_payout, put_payout];
  }

  if (put_payout > stake && call_payout <= stake) {
    // console.log([null, put_payout]);
    return [null, put_payout];
  }

  if (put_payout <= stake && call_payout > stake) {
    // console.log([call_payout, null]);
    return [call_payout, null];
  } else {
    // console.log("Contract is not offered");
    return [null, null];
  }
};

const crash100_stake = (payout, ticks) => {
  var S,
    S0,
    call_prob,
    call_stake,
    comm,
    d,
    node_prob,
    payoff,
    put_prob,
    put_stake,
    u;
  u = 0.01;
  d = 1 - u;
  payoff = 0;
  S0 = 100000;
  call_prob = 0;
  put_prob = 0;
  comm = 0.015;
  diff = 0;

  for (var i = 0, _pj_a = ticks + 1; i < _pj_a; i += 1) {
    node_prob =
      (factorial(ticks) / (factorial(ticks - i) * factorial(i))) *
      Math.pow(u, ticks - i) *
      Math.pow(1 - u, i);
    S = S0 - 99 * (ticks - i) + i;

    if (S - S0 > diff) {
      call_prob += node_prob;
      put_prob = put_prob;
    } else {
      call_prob = call_prob;
      put_prob += node_prob;
    }
  }

  call_stake = payout * (call_prob + comm);
  put_stake = payout * (put_prob + comm);

  if (payout > call_stake && payout > put_stake) {
    // console.log([call_stake, put_stake]);
    return [call_stake, put_stake];
  }

  if (payout > call_stake && payout <= put_stake) {
    // console.log([call_stake, null]);
    return [call_stake, null];
  }

  if (payout <= call_stake && payout > put_stake) {
    // console.log([null, put_stake]);
    return [null, put_stake];
  } else {
    // console.log("Contract is not offered");
    return [null, null];
  }
};

const crash100_winnings = (
  entry_price,
  exit_price,
  stake,
  ticks,
  option_type
) => {
  var winnings;

  if (option_type === "call") {
    if (exit_price > entry_price) {
      winnings = crash100_payout(stake, ticks)[0];
    } else {
      winnings = stake * -1;
    }
  } else {
    if (option_type === "put") {
      if (exit_price < entry_price) {
        winnings = crash100_payout(stake, ticks)[1];
      } else {
        winnings = stake * -1;
      }
    } else {
      throw new NotImplementedError("Supported option types: 'call', 'put'");
    }
  }
  // console.log(winnings);
  return winnings;
};

// crash100_winnings(900, 910, 10, 5, "call");
// crash100_winnings(900, 910, 10, 5, "put");
// crash100_winnings(900, 890, 10, 5, "call");
// crash100_winnings(900, 890, 10, 5, "put");

const even_odd_payout = (stake) => {
  var comm, payout;

  if (stake >= 1.0) {
    comm = Math.max(0.02, stake * 0.02);
    payout = (stake - comm) * 2;
    // console.log([Math.round(payout, 2), Math.round(payout, 2)]);
    return [
      Math.round(payout * 100, 2) / 100,
      Math.round(payout * 100, 2) / 100,
    ];
  } else {
    // console.log("Stake is too low");
    return [null, null];
  }
};

const even_odd_stake = (payout) => {
  var fixed_comm, fixed_stake, percentage_comm, percentage_stake, stake;
  fixed_comm = 0.02;
  percentage_comm = 0.02;
  fixed_stake = payout / 2 + fixed_comm;
  percentage_stake = ((payout / 2) * 1) / (1 - percentage_comm);
  stake = Math.max(fixed_stake, percentage_stake);

  if (stake >= 1) {
    // console.log([
    //   Math.round(stake * 100, 2) / 100,
    //   Math.round(stake * 100, 2) / 100,
    // ]);
    return [Math.round(stake * 100, 2) / 100, Math.round(stake * 100, 2) / 100];
  } else {
    // console.log("there");
    return [null, null];
  }
};

const even_odd_winnings = (bet, stake, exit_price) => {
  var comm, last_digit, net_stake, winnings;
  last_digit = Number.parseInt(exit_price.toString().slice(-1)[0]);
  comm = Math.max(0.02, stake * 0.02);
  net_stake = stake - comm;

  if (bet === "call") {
    if (Number.parseInt(last_digit % 2) === 0) {
      winnings = 2 * net_stake;
    } else {
      winnings = stake * -1;
    }
  }

  if (bet === "put") {
    if (Number.parseInt(last_digit % 2) !== 0) {
      winnings = 2 * net_stake;
    } else {
      winnings = stake * -1;
    }
  }
  console.log(winnings);
  return winnings;
};

// even_odd_winnings("even", 10, 397.1);
// even_odd_winnings("odd", 10, 397.1);
// even_odd_winnings("even", 10, 397.33);
// even_odd_winnings("odd", 10, 397.33);

const matches_differs_payout = (stake) => {
  var differs_payoff, matches_payoff;

  if (stake >= 1) {
    differs_payoff = (stake * 100) / 91;
    matches_payoff = (stake * 100) / 11;
    // console.log([
    //   Math.round(matches_payoff * 100, 2) / 100,
    //   Math.round(differs_payoff * 100, 2) / 100,
    // ]);
    return [
      Math.round(matches_payoff * 100, 2) / 100,
      Math.round(differs_payoff * 100, 2) / 100,
    ];
  } else {
    // console.log("Stake is too low");
    return [null, null];
  }
};

const matches_differs_stake = (payout) => {
  var differs_stake, matches_stake;
  differs_stake = Math.round(payout * 91, 2) / 100;
  matches_stake = Math.round(payout * 11, 2) / 100;

  if (differs_stake >= 1 && matches_stake >= 1) {
    // console.log([matches_stake, differs_stake]);
    return [matches_stake, differs_stake];
  }

  if (differs_stake < 1 && matches_stake >= 1) {
    // console.log([matches_stake, null]);
    return [matches_stake, null];
  }

  if (differs_stake >= 1 && matches_stake < 1) {
    // console.log([null, differs_stake]);
    return [null, differs_stake];
  } else {
    // console.log("Stake is too low");
    return [null, null];
  }
};

const matches_differs_winnings = (bet_type, bet_digit, stake, exit_price) => {
  var last_digit, winnings;
  last_digit = Number.parseInt(exit_price.toString().slice(-1)[0]);

  if (stake >= 1) {
    if (bet_type === "call") {
      if (last_digit !== bet_digit) {
        winnings = (stake * 100) / 91;
        // console.log(winnings);
        return winnings;
      } else {
        winnings = stake * -1;
        // console.log(winnings);
        return winnings;
      }
    } else {
      if (bet_type === "put") {
        if (last_digit === bet_digit) {
          winnings = (stake * 100) / 11;
          // console.log(winnings);
          return winnings;
        } else {
          winnings = stake * -1;
          // console.log(winnings);
          return winnings;
        }
      } else {
        return "Bet type must be 'call' or 'put'";
      }
    }
  } else {
    return "Stake is too low";
  }
};

const cdfNormal = (x, mean, standardDeviation) => {
  return (1 - erf((mean - x) / (Math.sqrt(2) * standardDeviation))) / 2;
};

const bs_binary_option = (St, K, sigma, delta_t, r, d, option_type) => {
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
};

const vol_rise_fall_payout = (stake, vol, ticks) => {
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
    // console.log([rise_payout, fall_payout]);
    return [rise_payout, fall_payout];
  } else {
    throw new NotImplementedError("Stake needs to be greater or equal to 1");
  }
};

const vol_rise_fall_stake = (payout, vol, ticks) => {
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
    // console.log([rise_stake, fall_stake]);
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
};

const vol_rise_fall_winnings = (
  entry_price,
  exit_price,
  stake,
  ticks,
  vol,
  option_type
) => {
  var winnings;

  if (option_type === "call") {
    if (exit_price > entry_price) {
      winnings = vol_rise_fall_payout(stake, vol, ticks)[0];
    } else {
      winnings = stake * -1;
    }
  } else {
    if (option_type === "put") {
      if (exit_price < entry_price) {
        winnings = vol_rise_fall_payout(stake, vol, ticks)[1];
      } else {
        winnings = stake * -1;
      }
    } else {
      throw new NotImplementedError("Supported option types: 'call', 'put'");
    }
  }
  // console.log(winnings);
  return winnings;
};

// vol_rise_fall_winnings(900, 910, 10, 5, 10, "call");
// vol_rise_fall_winnings(900, 910, 10, 5, 10, "put");
// vol_rise_fall_winnings(900, 890, 10, 5, 10, "call");
// vol_rise_fall_winnings(900, 890, 10, 5, 10, "put");
// vol_rise_fall_winnings(900, 910, 10, 5, 25, "call");
// vol_rise_fall_winnings(900, 910, 10, 5, 25, "put");
// vol_rise_fall_winnings(900, 890, 10, 5, 25, "call");
// vol_rise_fall_winnings(900, 890, 10, 5, 25, "put");

module.exports = {
  boom100_payout,
  boom100_stake,
  boom100_winnings,
  crash100_payout,
  crash100_stake,
  crash100_winnings,
  even_odd_payout,
  even_odd_stake,
  even_odd_winnings,
  matches_differs_payout,
  matches_differs_stake,
  matches_differs_winnings,
  bs_binary_option,
  vol_rise_fall_payout,
  vol_rise_fall_stake,
  vol_rise_fall_winnings,
};

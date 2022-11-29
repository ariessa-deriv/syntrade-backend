// This Javascript file contains the function to correctly price Boom 100 payouts by calling out boom100_payout AND
// the function to payout the winnings to the client upon conclusion of the bet using the function boom100_winnings

// boom100_payout
// Parameters:
// Stake: The amount of money the user is willing to bet
// Ticks: The number of ticks before the expiry of contract
// Option Type: Either "put" or "call" --> "call" is for Up and "put" is for Down

function factorial(n) {
  //base case
  if (n == 0 || n == 1) {
    return 1;
    //recursive case
  } else {
    return n * factorial(n - 1);
  }
}

// The boom100_payout requires:
// Stake: Amount of money that the client bets
// Ticks: Amount of ticks
// and returns an array of two values [call_payout, put_payout] where
// Call payout: Amount of money won by client for a correct Rise prediction
// Put payout: Amount of money won by client for a correct Fall prediction

function boom100_payout(stake, ticks) {
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
    console.log([call_payout, put_payout]);
    return [call_payout, put_payout];
  }

  if (put_payout > stake && call_payout <= stake) {
    console.log([null, put_payout]);
    return [null, put_payout];
  }

  if (put_payout <= stake && call_payout > stake) {
    console.log([call_payout, null]);
    return [call_payout, null];
  } else {
    console.log("Contract is not offered");
  }
}

// // Test cases
// boom100_payout(20, 1); // Expect [800, null]
// boom100_payout(20, 5); // Expect [ 312.45142307961277, 20.70414700655604 ]

// The boom100_stake requires:
// Payout: Amount of money that the client wishes to win from a correct prediction
// Ticks: Amount of ticks
// and returns an array of two values [call_stake, put_stake] where
// Call stake: Amount of money the user needs to bet to make a Rise prediction
// Put stake: Amount of money the user needs to bet to make a Fall prediction

function boom100_stake(payout, ticks) {
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
    console.log([call_stake, put_stake]);
    return [call_stake, put_stake];
  }

  if (payout > call_stake && payout <= put_stake) {
    console.log([call_stake, null]);
    return [call_stake, null];
  }

  if (payout <= call_stake && payout > put_stake) {
    console.log([null, put_stake]);
    return [null, put_stake];
  } else {
    console.log("Contract is not offered");
    return null;
  }
}

// // Test cases
// boom100_stake(800, 1); // First value 20, second value null
// boom100_stake(312.45, 5); // First value should be very close to 20, second value not null
// boom100_stake(20.7, 5); // Second value should be very close to 20, first value not null

// boom100_winnings
function boom100_winnings(entry_price, exit_price, stake, ticks, option_type) {
  var winnings;

  if (option_type === "call") {
    if (exit_price > entry_price) {
      winnings = boom100_payout(stake, ticks, option_type);
    } else {
      winnings = 0;
    }
  } else if (option_type === "put") {
    if (exit_price < entry_price) {
      winnings = boom100_payout(stake, ticks, option_type);
    } else {
      winnings = 0;
    }
  } else {
    throw new NotImplementedError("Supported option types: 'call', 'put'");
  }
  console.log(winnings);
  return winnings;
}

// // Test cases
// boom100_winnings(
//   (entry_price = 100),
//   (exit_price = 101),
//   (stake = 20),
//   (ticks = 1),
//   (option_type = "call")
// ); // This is a win, should offer 800

// boom100_winnings(
//   (entry_price = 100),
//   (exit_price = 101),
//   (stake = 20),
//   (ticks = 2),
//   (option_type = "put")
// ); // This contract is a loss, should offer 0

// boom100_winnings(
//   (entry_price = 100),
//   (exit_price = 101),
//   (stake = 20),
//   (ticks = 1),
//   (option_type = "put")
// ); // This contract should not be offered to begin with, throw error

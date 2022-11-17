// This Javascript file contains the function to correctly price Crash 100 payouts by calling out crash100_payout
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

function crash100_payout(stake, ticks, option_type) {
  var S,
    S0,
    comm,
    contract_unit_price,
    d,
    node_prob,
    num_contracts,
    payoff,
    payout,
    u,
    win_prob;
  u = 0.01;
  d = 1 - u;
  payoff = 0;
  S0 = 100000;
  win_prob = 0;
  comm = 0.015;

  for (var i = 0, _pj_a = ticks + 1; i < _pj_a; i += 1) {
    node_prob =
      (factorial(ticks) / (factorial(ticks - i) * factorial(i))) *
      Math.pow(u, ticks - i) *
      Math.pow(1 - u, i);
    S = S0 - 99 * (ticks - i) + i;

    if (option_type === "call") {
      if (S - S0 > 0) {
        payoff += node_prob;
      } else {
        payoff = payoff;
      }
    } else {
      if (option_type === "put") {
        if (S - S0 < 0) {
          payoff += node_prob;
        } else {
          payoff = payoff;
        }
      } else {
        throw new NotImplementedError("Supported option types: 'call', 'put'");
      }
    }
  }

  contract_unit_price = payoff + comm;
  num_contracts = stake / contract_unit_price;
  payout = num_contracts;

  if (payout > stake) {
    console.log(payout);
  } else {
    console.log("Contract is not offered");
  }
}

// // Test cases
// crash100_payout(20, 1, "put"); // Should be 800
// crash100_payout(20, 1, "call"); // Should not offer contract

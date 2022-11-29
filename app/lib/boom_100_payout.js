// This Javascript file contains the function to correctly price Boom 100 payouts by calling out boom100_payout AND
// the function to payout the winnings to the client upon conclusion of the bet using the function boom100_winnings

// boom100_payout
// Parameters:
// Stake: The amount of money the user is willing to bet
// Ticks: The number of ticks before the expiry of contract
// Option Type: Either "put" or "call" --> "call" is for Up and "put" is for Down

// TODO: allow ticks within 1-10 ticks only
// TODO: allow min stake of 1.00
// TODO: allow max payout up to 30000 only
function factorial(n) {
  //base case
  if (n == 0 || n == 1) {
    return 1;
    //recursive case
  } else {
    return n * factorial(n - 1);
  }
}

function boom100_payout(stake, ticks, option_type) {
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
    S = S0 + 99 * (ticks - i) - i;

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
    return payout;
  } else {
    console.log("Contract is not offered");
    return "Contract is not offered";
  }
}

// // Test cases
// boom100_payout(20, 1, "call"); // Should be 800
// boom100_payout(20, 1, "put"); // Should not offer contract
boom100_payout(500, 10, "call");
boom100_payout(500, 10, "put");

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

// boom100_payout(stake, ticks, option_type);

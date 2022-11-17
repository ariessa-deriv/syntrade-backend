// This Javascript file contains the function to correctly output how much money should be paid to the client at any time for ALL Crash and Boom Indices
// Parameters:
// Entry Price: The price at which the user enters the contract
// Current Price: The current real time price of the asset
// Stake: The amount of money which was staked by the user
// Multiplier: The multiplier that was chosen by the client
// Option Type: Either "call" or "put" --> "call" is for Up and "put" is for Down

function crashboom_curr_payoff(
  entry_price,
  curr_price,
  stake,
  multiplier,
  option_type
) {
  var comm, payoff;
  comm = Math.max(0.02, 0.0001 * multiplier * stake);

  if (option_type === "call") {
    payoff = ((curr_price - entry_price) / entry_price) * multiplier;
  } else {
    if (option_type === "put") {
      payoff = ((entry_price - curr_price) / entry_price) * multiplier;
    } else {
      throw new NotImplementedError("Supported option types: 'call', 'put'");
    }
  }

  if ((stake - comm) * (1 + payoff) > 0) {
    console.log((stake - comm) * (1 + payoff));
  } else {
    console.log("Bet is terminated");
  }
}

// Problem recreation (example)
// Entry Price: 101, Current price: 100, Stake: 100, Multiplier: 100x, Option Type: Call
// crashboom_curr_payoff(
//   (entry_price = 101),
//   (curr_price = 100),
//   (stake = 100),
//   (multiplier = 100),
//   (option_type = "call")
// );
// // Expected output: 0.9801980198019811

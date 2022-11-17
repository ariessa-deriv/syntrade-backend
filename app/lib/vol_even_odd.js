// This Javascript file contains the function to correctly output the appropriate payout for a bet in the Even Odd trade type.
// Parameters:
// Stake: The amount of money bet by the client

function even_odd_payout(stake) {
  var comm, payout;

  if (stake >= 0.35) {
    comm = Math.max(0.02, stake * 0.02);
    payout = (stake - comm) * 2;
    console.log(payout);
    return Math.round(payout, 2);
  } else {
    return "Stake is too low";
  }
}

// //Test case
// even_odd_payout(10); // Should return 19.6

// This function determines if the client won or lost the bet, and pays them accordingly
function even_odd_winnings(bet, stake, exit_price) {
  var comm, last_digit, net_stake, payoff, winnings;
  last_digit = Number.parseInt(exit_price.toString().slice(-1)[0]);
  comm = Math.max(0.02, stake * 0.02);
  net_stake = stake - comm;

  if (bet === "even") {
    if (Number.parseInt(last_digit % 2) === 0) {
      winnings = 2 * net_stake;
    } else {
      payoff = 0;
    }
  }

  if (bet === "odd") {
    if (Number.parseInt(last_digit % 2) !== 0) {
      winnings = 2 * net_stake;
    } else {
      winnings = 0;
    }
  }
  console.log(winnings);
  return [winnings, exit_price];
}

// // Test case
// even_odd_winnings("even", 100, 98.92); // The client wins the bet, pay out 196

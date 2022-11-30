// This Javascript file contains the function to correctly output the appropriate payout for a bet in the Even Odd trade type.
// Parameters:
// Stake: The amount of money bet by the client

// The even_odd_payout requires:
// Stake: Amount of money that the client bets
// and returns a value, which is the payout
// Payout: The amount won by the client for a correct Even or Odd prediction
// NOTE: Even and Odd pays the same payout for any given stake.

function even_odd_payout(stake) {
  var comm, payout;

  if (stake >= 0.35) {
    comm = Math.max(0.02, stake * 0.02);
    payout = (stake - comm) * 2;
    console.log(payout);
    console.log(Math.round(payout * 100, 2) / 100);
    return Math.round(payout * 100, 2) / 100;
  } else {
    return "Stake is too low";
  }
}

//Test case
even_odd_payout(10); // Should return 19.6

// The even_odd_stake requires:
// Payout: Amount of money that the client wishes to win from a correct prediction
// and returns a value, which is the stake required
// Stake: Amount of money that the client is required to bet to win the desired Payout
// NOTE: Even and Odd pays requires the same Stake to win any desired Payout

function even_odd_stake(payout) {
  var fixed_comm, fixed_stake, percentage_comm, percentage_stake, stake;
  fixed_comm = 0.02;
  percentage_comm = 0.02;
  fixed_stake = payout / 2 + fixed_comm;
  percentage_stake = ((payout / 2) * 1) / (1 - percentage_comm);
  stake = Math.max(fixed_stake, percentage_stake);

  if (stake >= 0.35) {
    console.log(Math.round(stake, 2));
    return Math.round(stake * 100, 2) / 100;
  } else {
    return "Stake is too low";
  }
}

//Test case
even_odd_stake(19.6); // Should return 10

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

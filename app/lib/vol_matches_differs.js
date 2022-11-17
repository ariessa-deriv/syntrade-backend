// This Javascript file contains the function to correctly output the appropriate payout for a bet in the Matches/Differs trade type.
// Parameters:
// Bet: Must be "matches" or "differs" --> "matches" means the client bets that the last digit will be the same as their predicted digit
// Stake: The amount of money bet by the client

function match_differs_payoff(bet, stake) {
  var payoff;

  if (stake >= 1) {
    if (bet === "differs") {
      payoff = (stake * 100) / 91;
      console.log(payoff);
      return Math.round(payoff, 2);
    } else {
      if (bet === "matches") {
        payoff = (stake * 100) / 11;
        console.log(payoff);
        return Math.round(payoff, 2);
      } else {
        return "Bet must be 'matches' or 'differs'";
      }
    }
  } else {
    return "Stake is too low";
  }
}

// // Problem recreation (example)
// match_differs_payoff("differs", 100);
// // Expected output: 109.89

// This function determines if client wins or loses, and pays them accordingly
function match_differs_winnings(bet_type, bet_digit, stake, exit_price) {
  var last_digit, winnings;
  last_digit = Number.parseInt(exit_price.toString().slice(-1)[0]);

  if (stake >= 1) {
    if (bet_type === "differs") {
      if (last_digit !== bet_digit) {
        winnings = (stake * 100) / 91;
        console.log(winnings);
        return winnings;
      } else {
        winnings = 0;
        console.log(winnings);
        return winnings;
      }
    } else {
      if (bet_type === "matches") {
        if (last_digit === bet_digit) {
          winnings = (stake * 100) / 11;
          console.log(winnings);
          return winnings;
        } else {
          winnings = 0;
          console.log(winnings);
          return winnings;
        }
      } else {
        return "Bet type must be 'match' or 'differs'";
      }
    }
  } else {
    return "Stake is too low";
  }
}

// match_differs_winnings("matches", 6, 100, 37.96);
// match_differs_winnings("differs", 6, 100, 37.93);

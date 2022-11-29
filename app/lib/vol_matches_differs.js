// The matches_differs_payout requires:
// Stake: Amount of money that the client bets
// and returns an array [matches_payoff, differs_payoff]
// Matches Payout: Amount of money that the client wins for a correct Matches prediction
// Differs Payout: Amount of money that the client wins for a correct Differs prediction

function match_differs_payoff(stake) {
  var differs_payoff, matches_payoff;

  if (stake >= 1) {
    differs_payoff = (stake * 100) / 91;
    matches_payoff = (stake * 100) / 11;
    console.log([
      Math.round(matches_payoff * 100, 2) / 100,
      Math.round(differs_payoff * 100, 2) / 100,
    ]);
    return [
      Math.round(matches_payoff * 100, 2) / 100,
      Math.round(differs_payoff * 100, 2) / 100,
    ];
  } else {
    return "Stake is too low";
  }
}

// Problem recreation (example)
match_differs_payoff(100);
// Expected output: 109.

// The match_differs_stake requires:
// Payout: Amount of money that the client wishes to win from a correct prediction
// and returns an array [matches_stake, differs_stake]
// Matches Stake: Amount of Stake that the client is required to bet to win the desired Payout for a Matches prediction
// Differs Stake: Amount of Stake that the client is required to bet to win the desired Payout for a Differs prediction

function match_differs_stake(payout) {
  var differs_stake, matches_stake;
  differs_stake = Math.round(payout * 91, 2) / 100;
  matches_stake = Math.round(payout * 11, 2) / 100;

  if (differs_stake >= 1 && matches_stake >= 1) {
    console.log([matches_stake, differs_stake]);
    return [matches_stake, differs_stake];
  }

  if (differs_stake < 1 && matches_stake >= 1) {
    console.log([matches_stake, null]);
    return [matches_stake, null];
  }

  if (differs_stake >= 1 && matches_stake < 1) {
    console.log([null, differs_stake]);
    return [null, differs_stake];
  } else {
    return "Stake is too low";
  }
}

// Problem recreation (example)
match_differs_stake(6);
// Expected output: [null, 5.46]

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

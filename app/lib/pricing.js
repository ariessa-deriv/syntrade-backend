function factorial(n) {
  //base case
  if (n == 0 || n == 1) {
    return 1;
    //recursive case
  } else {
    return n * factorial(n - 1);
  }
}

function boom100_stake(stake, ticks) {
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
  console.log([call_payout, put_payout]);
  return [call_payout, put_payout];
}



boom100_stake(500, 10);

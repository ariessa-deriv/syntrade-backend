const cacheClient = require("../lib/cache");

// Convert date in UTC timezone to Asia/Kuala Lumpur timezone
const convertTimezone = (date) => {
  return new Date(
    (typeof date === "number" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
    })
  );
};

// Filter element that has "time":$transaction_time_asia_kuala_lumpur
const findTransactionByTime = async (transaction_time_asia_kuala_lumpur) => {
  const historical_list = await cacheClient.lrange("historical_prices", 0, -1);

  return historical_list.filter((item) => {
    if (item.includes(`"time":${transaction_time_asia_kuala_lumpur}`)) {
      return true;
    }
  });
};

module.exports = { convertTimezone, findTransactionByTime };

const dotenv = require("dotenv");
const { resolvers: scalarResolvers } = require("graphql-scalars");
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
} = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SyntheticEnum = require("./enum/synthetic");
const TransactionEnum = require("./enum/transaction");
const databasePool = require("../lib/database");
const User = require("./object/user");
const Trade = require("./object/trade");
const { isEmailValid, isPasswordValid } = require("../lib/input_validations");
const Cookies = require("cookies");
const transporter = require("../lib/mail");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const {
  convertTimezone,
  findTransactionByTime,
} = require("../lib/utilities");
const cacheClient = require("../lib/cache");
const {
  boom100_winnings,
  crash100_winnings,
  even_odd_winnings,
  match_differs_winnings,
  vol_rise_fall_winnings,
} = require("../lib/pricing");

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createBuyTrade: {
      type: GraphQLInt, // return 200 for OK and 400 for other errors
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) },
        synthetic_type: { type: GraphQLNonNull(GraphQLString) },
        option_type: { type: GraphQLNonNull(GraphQLString) },
        wager_amount: { type: GraphQLNonNull(GraphQLFloat) },
        ticks: { type: GraphQLNonNull(GraphQLInt) },
        last_digit_prediction: { type: GraphQLInt },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        const validSyntheticType = [
          "boom_100_rise",
          "boom_100_fall",
          "crash_100_rise",
          "crash_100_fall",
          "volatility_10_even",
          "volatility_10_odd",
          "volatility_10_matches",
          "volatility_10_differs",
          "volatility_10_rise",
          "volatility_10_fall",
          "volatility_25_even",
          "volatility_25_odd",
          "volatility_25_matches",
          "volatility_25_differs",
          "volatility_25_rise",
          "volatility_25_fall",
        ];

        const user_id = args.user_id;
        const synthetic_type = args.synthetic_type.toLowerCase();
        const option_type = args.option_type.toLowerCase();
        const wager_amount = parseFloat(args.wager_amount.toFixed(2));
        const ticks = args.ticks;
        const last_digit_prediction = args.last_digit_prediction | 0;
        let isSyntheticTypeValid = false;
        let isOptionTypeValid = false;
        let isWagerAmountValid = false;
        let isTicksValid = false;
        let isCurrentWalletBalanceSufficient = false;
        let isUpdatedWalletBalanceValid = false;
        const buy_transaction = "buy";
        const sell_transaction = "sell";
        const transaction_time_asia_kuala_lumpur =
          Math.floor(Date.parse(convertTimezone(Date.now())) / 1000) - 1;
        const cleanedSyntheticModel = synthetic_type.substr(
          0,
          synthetic_type.lastIndexOf("_")
        );
        let entry_price = 0.0;
        let exit_price = 0.0;
        let transaction = [];
        let buyTradeTransaction = [];
        let winnings = 0;

        console.log(
          "transaction_time_asia_kuala_lumpur: ",
          transaction_time_asia_kuala_lumpur
        );

        console.log("cleanedSyntheticModel: ", cleanedSyntheticModel);

        // Check if synthetic_type is valid or not
        isSyntheticTypeValid = validSyntheticType.includes(synthetic_type);

        // Check if option_type is valid or not
        isOptionTypeValid = option_type == "call" || option_type == "put";

        // Check if wager_amount is valid or not
        isWagerAmountValid = wager_amount >= 1.0;

        // Check if ticks is valid or not
        isTicksValid = ticks >= 1 && ticks <= 10;

        console.log("synthetic_type: ", synthetic_type);
        console.log("isSyntheticValid: ", isSyntheticTypeValid);
        console.log("option_type: ", option_type);
        console.log("isOptionTypeValid: ", isOptionTypeValid);
        console.log("wager_amount: ", wager_amount);
        console.log("typeof wager_amount: ", typeof wager_amount);
        console.log("isWagerAmountValid: ", isWagerAmountValid);
        console.log("ticks: ", ticks);
        console.log("isTicksValid: ", isTicksValid);

        // Check if synthetic_type, wager_type, wager_amount and ticks are valid or not
        if (
          isSyntheticTypeValid &&
          isOptionTypeValid &&
          isWagerAmountValid &&
          isTicksValid
        ) {
          console.log("synthetic_type, wager_amount and ticks are valid");

          try {
            // Get user's current wallet balance
            const current_wallet_balance = await databasePool.query(
              `SELECT wallet_balance FROM users WHERE users.user_id = $1;`,
              [user_id]
            );

            // Check if user's current wallet balance is more than wager_amount or not
            isCurrentWalletBalanceSufficient =
              current_wallet_balance.rows[0].wallet_balance >= wager_amount;

            console.log(
              "current_wallet_balance: ",
              current_wallet_balance.rows[0].wallet_balance
            );
            console.log(
              "isCurrentWalletBalanceSufficient: ",
              isCurrentWalletBalanceSufficient
            );

            if (isCurrentWalletBalanceSufficient) {
              // Decrease user's current balance by wager_amount
              const decrease_wallet_balance = await databasePool.query(
                "UPDATE users SET wallet_balance = wallet_balance - $2 WHERE user_id = $1 RETURNING wallet_balance",
                [user_id, wager_amount]
              );

              console.log(
                "decrease_wallet_balance: ",
                decrease_wallet_balance.rows[0].wallet_balance
              );

              console.log(
                "current_wallet_balance: ",
                current_wallet_balance.rows[0].wallet_balance
              );

              console.log(
                "current_wallet_balance - wager_amount: ",
                parseFloat(current_wallet_balance.rows[0].wallet_balance) -
                  wager_amount
              );

              const updated_wallet_balance =
                parseFloat(current_wallet_balance.rows[0].wallet_balance) -
                wager_amount;

              // Check if user's wallet balance has been correctly decreased or not
              isUpdatedWalletBalanceValid =
                updated_wallet_balance ==
                decrease_wallet_balance.rows[0].wallet_balance;

              console.log(
                "isUpdatedWalletBalanceValid: ",
                isUpdatedWalletBalanceValid
              );

              if (isUpdatedWalletBalanceValid) {
              }

              // Execute function for a maximum of 3 retries
              for (var i = 0; i < 3; i++) {
                console.log("transaction.length: ", transaction.length);
                console.log("transaction.length: ", transaction.length);
                if (transaction.length == 0) {
                  console.log("i: ", i);
                  transaction = await findTransactionByTime(
                    transaction_time_asia_kuala_lumpur
                  );
                  console.log("transaction: ", transaction);
                }
              }

              // console.log("transaction: ", transaction);

              entry_price = JSON.parse(transaction[0])[cleanedSyntheticModel];

              console.log("entry_price: ", entry_price);

              // Insert buy trade inside database
              const insertBuyTrade = await databasePool.query(
                "INSERT INTO trades (user_id, synthetic_type, transaction_time, transaction_type, transaction_amount, current_wallet_balance, ticks, current_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                [
                  user_id,
                  synthetic_type,
                  transaction_time_asia_kuala_lumpur,
                  buy_transaction,
                  wager_amount,
                  updated_wallet_balance,
                  ticks,
                  entry_price,
                ]
              );

              console.log("insertBuyTrade: ", insertBuyTrade.rows[0]);

              // Notify frontend to display buy trade success snackbar

              // Get entry price from transaction time in redis list
              // let list_key =
              //   "historical_" +
              //   synthetic_type.substr(0, synthetic_type.lastIndexOf("_"));

              // console.log("list: ", list_key);

              const buyTradeEndTime =
                parseInt(insertBuyTrade.rows[0].ticks) +
                parseInt(insertBuyTrade.rows[0].transaction_time);

              console.log(
                "insertBuyTrade.rows[0].ticks: ",
                insertBuyTrade.rows[0].ticks
              );

              console.log(
                "insertBuyTrade.rows[0].trade_time: ",
                insertBuyTrade.rows[0].transaction_time
              );

              console.log("buyTradeEndTime: ", buyTradeEndTime);

              // After buy trade end time is passed, calculate user's winnings
              setTimeout(async () => {
                // Execute function for a maximum of three retries
                for (var i = 0; i < 3; i++) {
                  console.log(
                    "buyTradeTransaction.length: ",
                    buyTradeTransaction.length
                  );
                  if (buyTradeTransaction.length == 0) {
                    console.log("i: ", i);
                    buyTradeTransaction = await findTransactionByTime(
                      buyTradeEndTime
                    );
                    console.log("buyTradeTransaction: ", buyTradeTransaction);
                  }
                }

                // console.log("buyTradeTransaction: ", buyTradeTransaction);

                exit_price = JSON.parse(buyTradeTransaction[0])[
                  cleanedSyntheticModel
                ];

                console.log("exit_price: ", exit_price);

                if (cleanedSyntheticModel == "boom_100") {
                  winnings = boom100_winnings(
                    entry_price,
                    exit_price,
                    wager_amount,
                    ticks,
                    option_type
                  );
                  console.log("boom_100 winnings: ", winnings);
                } else if (cleanedSyntheticModel == "crash_100") {
                  winnings = crash100_winnings(
                    entry_price,
                    exit_price,
                    wager_amount,
                    ticks,
                    option_type
                  );
                  console.log("crash_100 winnings: ", winnings);
                } else if (synthetic_type.includes("even_odd")) {
                  winnings = even_odd_winnings(
                    option_type,
                    wager_amount,
                    exit_price
                  );
                  console.log("even_odd winnings: ", winnings);
                } else if (synthetic_type.includes("matches_differs")) {
                  winnings = matches_differs_winnings(
                    option_type,
                    last_digit_prediction,
                    wager_amount,
                    exit_price
                  );
                  console.log("matches_differs winnings: ", winnings);
                } else {
                  const volatilityType = synthetic_type.includes(
                    "volatility_10"
                  )
                    ? 10
                    : 25;

                  console.log("volatilityType: ", volatilityType);

                  winnings = vol_rise_fall_winnings(
                    entry_price,
                    exit_price,
                    wager_amount,
                    ticks,
                    volatilityType,
                    option_type
                  );
                  console.log("volatility_rise_fall winnings: ", winnings);
                }

                // Insert sell trade inside database
                const insertSellTrade = await databasePool.query(
                  "INSERT INTO trades (user_id, synthetic_type, transaction_time, transaction_type, transaction_amount, current_wallet_balance, ticks, current_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                  [
                    user_id,
                    synthetic_type,
                    transaction_time_asia_kuala_lumpur,
                    sell_transaction,
                    parseFloat(winnings.toFixed(2)),
                    updated_wallet_balance,
                    ticks,
                    exit_price,
                  ]
                );

                console.log("insertSellTrade: ", insertSellTrade.rows[0]);
                // Notify frontend to display user's winnings or losses
                return 200;
              }, ticks * 1500);
            }
          } catch (err) {
            console.log("Failed somewhere");
            return 400;
          }
        }
      },
    },
    changePassword: {
      type: scalarResolvers.Void,
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          await databasePool.query(
            "UPDATE users SET password = $2 WHERE user_id = $1 RETURNING *",
            [args.user_id, args.password]
          );
          // return (
          //   await databasePool.query(
          //     "UPDATE users SET password = $2 WHERE user_id = $1 RETURNING *",
          //     [args.user_id, args.password]
          //   )
          // ).rows[0];
        } catch (err) {
          throw new Error("Failed to change user's password");
        }
      },
    },
    deleteUser: {
      type: User,
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          return (
            await databasePool.query(
              "DELETE FROM users WHERE user_id = $1 RETURNING *",
              [args.user_id]
            )
          ).rows[0];
        } catch (err) {
          throw new Error("Failed to insert new user");
        }
      },
    },
    signup: {
      type: User,
      args: {
        email: { type: GraphQLNonNull(scalarResolvers.EmailAddress) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        // Normalise email address
        const normalisedEmail = args.email.trim().toLowerCase();

        if (isEmailValid(normalisedEmail) && isPasswordValid(args.password)) {
          // Hash the password
          const hashedPassword = await bcrypt.hash(args.password, 10);

          // Check if email has been registered or not
          const registeredUser = await databasePool.query(
            `SELECT * FROM users WHERE email = '${normalisedEmail}';`
          );

          if (registeredUser.rowCount > 0) {
            throw new Error("Email is already registered");
          }

          try {
            const userToSignup = await databasePool.query(
              `INSERT INTO users (email, password) VALUES ('${normalisedEmail}', '${hashedPassword}') RETURNING *;`
            );

            return userToSignup;
          } catch (err) {
            console.log(err);
            throw new Error("Error signing up for a new account");
          }
        }
      },
    },
    login: {
      type: User,
      args: {
        email: { type: GraphQLNonNull(scalarResolvers.EmailAddress) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        // Normalise email address
        const normalisedEmail = args.email.trim().toLowerCase();

        if (isEmailValid(normalisedEmail) && isPasswordValid(args.password)) {
          // Find user by email address
          const userToLogin = await databasePool.query(
            `SELECT * FROM users WHERE email = '${normalisedEmail}'`
          );

          // if there is no user, throw an authentication error
          if (!userToLogin) {
            throw new Error("Error signing in");
          }

          // if the passwords don't match, throw an authentication error
          const valid = await bcrypt.compare(
            args.password,
            userToLogin.rows[0]["password"]
          );
          if (!valid) {
            throw new Error("Incorrect password");
          }

          // Create JWT
          const token = jwt.sign(
            {
              id: userToLogin.user_id,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "2h",
            }
          );

          // Store JWT as HTTP Only Cookie
          context.cookies.set("auth-token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 6 * 60 * 60,
            secure: false,
          });

          console.log("context", context);

          // create and return the json web token
          return userToLogin.rows[0];
        }
      },
    },
    forgotPassword: {
      type: scalarResolvers.Void,
      args: {
        email: { type: GraphQLNonNull(scalarResolvers.EmailAddress) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        // Normalise email address
        const normalisedEmail = args.email.trim().toLowerCase();

        var chars =
          "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var passwordLength = 12;
        var password = "";

        if (isEmailValid(normalisedEmail)) {
          // Find user by email
          const registeredUser = await databasePool.query(
            `SELECT * FROM users WHERE email = '${normalisedEmail}';`
          );

          // If email does no exist in database, throw an error
          if (registeredUser.rowCount < 0) {
            throw new Error("Email does not exist in database");
          }
          // If email exists in database, generate a random password to user
          else {
            for (var i = 0; i <= passwordLength; i++) {
              var randomNumber = Math.floor(Math.random() * chars.length);
              password += chars.substring(randomNumber, randomNumber + 1);
            }

            console.log("randomPassword: ", password);

            // Update user's password with newly generated random password
            await databasePool.query(
              "UPDATE users SET password = $2 WHERE user_id = $1",
              [args.user_id, password]
            );

            // TODO: Create password reset link for user
            const passwordResetLink = "https://app.syntrade.xyz/reset_password";

            const filePath = path.join(
              __dirname,
              "../lib/reset_password_template.html"
            );
            const source = fs.readFileSync(filePath, "utf-8").toString();
            const template = handlebars.compile(source);
            const replacements = {
              resetLink: passwordResetLink,
            };
            const htmlToSend = template(replacements);

            // Send email to user with link to password reset page (link expires in 10 mins)
            const mailOptions = {
              from: process.env.GMAIL_USER,
              to: normalisedEmail,
              subject: "Syntrade Password Reset",
              html: htmlToSend,
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });
          }
        }
      },
    },
    resetBalance: {
      type: GraphQLFloat,
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await databasePool.query(
              "UPDATE users SET wallet_balance = 10000 WHERE user_id = $1 RETURNING wallet_balance",
              [args.user_id]
            )
          ).rows[0].wallet_balance;
        } catch (err) {
          throw new Error("Failed to reset user's balance");
        }
      },
    },

    updateBalance: {
      type: GraphQLFloat,
      args: {
        user_id: { type: new GraphQLNonNull(GraphQLInt) },
        stakePayout: { type: new GraphQLNonNull(GraphQLFloat) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        console.log("user id: ", args.user_id);
        console.log("stake payout: ", args.stakePayout);
        try {
          return (
            await databasePool.query(
              "UPDATE users SET wallet_balance = wallet_balance + $2 WHERE user_id = $1 RETURNING wallet_balance",
              [args.user_id, args.stakePayout]
            )
          ).rows[0].wallet_balance;
        } catch (err) {
          throw new Error("Failed to update user's balance");
        }
      },
    },
  }),
});

module.exports = Mutation;

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
const { convertTimezone, findTransactionByTime } = require("../lib/utilities");
const cacheClient = require("../lib/cache");
const {
  boom100_winnings,
  crash100_winnings,
  even_odd_winnings,
  matches_differs_winnings,
  vol_rise_fall_winnings,
} = require("../lib/pricing");

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createTrade: {
      type: GraphQLInt, // return 200 for OK and 400 for other errors
      args: {
        userId: { type: GraphQLNonNull(GraphQLInt) },
        syntheticType: { type: GraphQLNonNull(GraphQLString) },
        optionType: { type: GraphQLNonNull(GraphQLString) },
        wagerAmount: { type: GraphQLNonNull(GraphQLFloat) },
        ticks: { type: GraphQLNonNull(GraphQLInt) },
        lastDigitPrediction: { type: GraphQLInt },
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

        const userId = args.userId;
        const syntheticType = args.syntheticType.toLowerCase();
        const optionType = args.optionType.toLowerCase();
        const wagerAmount = parseFloat(args.wagerAmount.toFixed(2));
        const ticks = args.ticks;
        const lastDigitPrediction = args.lastDigitPrediction || 0;
        let isSyntheticTypeValid = false;
        let isOptionTypeValid = false;
        let isWagerAmountValid = false;
        let isTicksValid = false;
        let isLastDigitPredictionValid = false;
        let isCurrentWalletBalanceSufficient = false;
        let isUpdatedWalletBalanceValid = false;
        const buyTransaction = "buy";
        const sellTransaction = "sell";
        const transactionTimeAsiaKualaLumpur =
          Math.floor(Date.parse(convertTimezone(Date.now())) / 1000) - 1;
        const cleanedSyntheticModel = syntheticType.substr(
          0,
          syntheticType.lastIndexOf("_")
        );
        let entryPrice = 0.0;
        let exitPrice = 0.0;
        let transaction = [];
        let buyTradeTransaction = [];
        let winnings = 0;

        console.log(
          "transactionTimeAsiaKualaLumpur: ",
          transactionTimeAsiaKualaLumpur
        );

        console.log("cleanedSyntheticModel: ", cleanedSyntheticModel);

        // Check if syntheticType is valid or not
        isSyntheticTypeValid = validSyntheticType.includes(syntheticType);

        // Check if optionType is valid or not
        isOptionTypeValid = optionType == "call" || optionType == "put";

        // Check if wagerAmount is valid or not
        isWagerAmountValid = wagerAmount >= 1.0;

        // Check if ticks is valid or not
        isTicksValid = ticks >= 1 && ticks <= 10;

        // Check if last digit prediction is valid or not
        isLastDigitPredictionValid =
          lastDigitPrediction >= 0 && lastDigitPrediction <= 9;

        console.log("syntheticType: ", syntheticType);
        console.log("isSyntheticValid: ", isSyntheticTypeValid);
        console.log("optionType: ", optionType);
        console.log("isOptionTypeValid: ", isOptionTypeValid);
        console.log("wagerAmount: ", wagerAmount);
        console.log("isWagerAmountValid: ", isWagerAmountValid);
        console.log("ticks: ", ticks);
        console.log("isTicksValid: ", isTicksValid);
        console.log("lastDigitPrediction: ", lastDigitPrediction);
        console.log("isLastDigitPrediction: ", isLastDigitPredictionValid);

        // Check if syntheticType, optionType, wagerAmount, ticks, and lastDigitPrediction are valid or not
        if (
          isSyntheticTypeValid &&
          isOptionTypeValid &&
          isWagerAmountValid &&
          isTicksValid &&
          isLastDigitPredictionValid
        ) {
          console.log(
            "syntheticType, optionType, wagerAmount, ticks, and lastDigitPrediction are valid"
          );

          try {
            // Get user's current wallet balance
            const current_wallet_balance = await databasePool.query(
              `SELECT wallet_balance FROM users WHERE users.user_id = $1;`,
              [userId]
            );

            // Check if user's current wallet balance is more than wagerAmount or not
            isCurrentWalletBalanceSufficient =
              current_wallet_balance.rows[0].wallet_balance >= wagerAmount;

            console.log(
              "current_wallet_balance: ",
              current_wallet_balance.rows[0].wallet_balance
            );
            console.log(
              "isCurrentWalletBalanceSufficient: ",
              isCurrentWalletBalanceSufficient
            );

            if (isCurrentWalletBalanceSufficient) {
              // Decrease user's current balance by wagerAmount
              const decrease_wallet_balance = await databasePool.query(
                "UPDATE users SET wallet_balance = wallet_balance - $2 WHERE user_id = $1 RETURNING wallet_balance",
                [userId, wagerAmount]
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
                "current_wallet_balance - wagerAmount: ",
                parseFloat(current_wallet_balance.rows[0].wallet_balance) -
                  wagerAmount
              );

              const updated_wallet_balance =
                parseFloat(current_wallet_balance.rows[0].wallet_balance) -
                wagerAmount;

              // Check if user's wallet balance has been correctly decreased or not
              isUpdatedWalletBalanceValid =
                updated_wallet_balance ==
                decrease_wallet_balance.rows[0].wallet_balance;

              console.log(
                "isUpdatedWalletBalanceValid: ",
                isUpdatedWalletBalanceValid
              );

              if (isUpdatedWalletBalanceValid) {
                // Execute function for a maximum of 3 retries
                for (var i = 0; i < 3; i++) {
                  console.log("transaction.length: ", transaction.length);
                  console.log("transaction.length: ", transaction.length);
                  if (transaction.length == 0) {
                    console.log("i: ", i);
                    transaction = await findTransactionByTime(
                      transactionTimeAsiaKualaLumpur
                    );
                    console.log("transaction: ", transaction);
                  }
                }

                entryPrice = JSON.parse(transaction[0])[cleanedSyntheticModel];

                console.log("entryPrice: ", entryPrice);

                // Insert buy trade inside database
                const insertBuyTrade = await databasePool.query(
                  "INSERT INTO trades (user_id, synthetic_type, transaction_time, transaction_type, transaction_amount, current_wallet_balance, ticks, current_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                  [
                    userId,
                    syntheticType,
                    transactionTimeAsiaKualaLumpur,
                    buyTransaction,
                    wagerAmount,
                    updated_wallet_balance,
                    ticks,
                    entryPrice,
                  ]
                );

                console.log("insertBuyTrade: ", insertBuyTrade.rows[0]);

                if (insertBuyTrade.rows.length == 1) {
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
                        console.log(
                          "buyTradeTransaction: ",
                          buyTradeTransaction
                        );
                      }
                    }

                    exitPrice = JSON.parse(buyTradeTransaction[0])[
                      cleanedSyntheticModel
                    ];

                    console.log("exitPrice: ", exitPrice);

                    if (cleanedSyntheticModel == "boom_100") {
                      winnings = boom100_winnings(
                        entryPrice,
                        exitPrice,
                        wagerAmount,
                        ticks,
                        optionType
                      );
                      console.log("boom_100 winnings: ", winnings);
                    } else if (cleanedSyntheticModel == "crash_100") {
                      winnings = crash100_winnings(
                        entryPrice,
                        exitPrice,
                        wagerAmount,
                        ticks,
                        optionType
                      );
                      console.log("crash_100 winnings: ", winnings);
                    } else if (
                      syntheticType.includes("even") ||
                      syntheticType.includes("odd")
                    ) {
                      winnings = even_odd_winnings(
                        optionType,
                        wagerAmount,
                        exitPrice
                      );
                      console.log("even_odd winnings: ", winnings);
                    } else if (
                      syntheticType.includes("matches") ||
                      syntheticType.includes("differs")
                    ) {
                      winnings = matches_differs_winnings(
                        optionType,
                        lastDigitPrediction,
                        wagerAmount,
                        exitPrice
                      );
                      console.log("matches_differs winnings: ", winnings);
                    } else {
                      const volatilityType = syntheticType.includes(
                        "volatility_10"
                      )
                        ? 10
                        : 25;

                      console.log("volatilityType: ", volatilityType);

                      winnings = vol_rise_fall_winnings(
                        entryPrice,
                        exitPrice,
                        wagerAmount,
                        ticks,
                        volatilityType,
                        optionType
                      );
                      console.log("volatility_rise_fall winnings: ", winnings);
                    }

                    // Insert sell trade inside database
                    const insertSellTrade = await databasePool.query(
                      "INSERT INTO trades (user_id, synthetic_type, transaction_time, transaction_type, transaction_amount, current_wallet_balance, ticks, current_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                      [
                        userId,
                        syntheticType,
                        transactionTimeAsiaKualaLumpur,
                        sellTransaction,
                        parseFloat(winnings.toFixed(2)),
                        updated_wallet_balance,
                        ticks,
                        exitPrice,
                      ]
                    );

                    console.log("insertSellTrade: ", insertSellTrade.rows[0]);

                    // Notify frontend to display user's winnings or losses
                    if (insertSellTrade.rows.length == 1) {
                      return 200;
                    }
                  }, ticks * 1500);
                } else {
                  console.log("Failed to insert buy trade into database");
                  return 400;
                }
              } else {
                console.log("Invalid Updated Wallet Balance");
                return 400;
              }
            }
          } catch (err) {
            console.log("Error: ", err);
            return 400;
          }
        }
      },
    },
    changePassword: {
      type: GraphQLInt,
      args: {
        userId: { type: GraphQLNonNull(GraphQLInt) },
        curentPassword: { type: GraphQLNonNull(GraphQLString) },
        newPassword: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        const userId = args.userId;
        const currentPassword = args.currentPassword;
        const newPassword = args.newPassword;

        const isUserIdValid = userId > 0;
        const isCurrentPasswordValid = isPasswordValid(currentPassword);
        const isNewPasswordValid = isNewPasswordValid(newPassword);
        const doesPasswordsMatch = currentPassword === newPassword;

        console.log("userId: ", userId);
        console.log("isUserIdValid: ", isUserIdValid);
        console.log("currentPassword: ", currentPassword);
        console.log("isCurrentPasswordValid: ", isCurrentPasswordValid);
        console.log("newPassword: ", newPassword);
        console.log("isNewPasswordValid: ", isNewPasswordValid);
        console.log("doesPasswordsMatch: ", doesPasswordsMatch);

        if (
          isUserIdValid &&
          isCurrentPasswordValid &&
          isNewPasswordValid &&
          !doesPasswordsMatch
        ) {
          try {
            // Validate both passwords
            // Check if user with supplied userId exists in database
            // Check if both oldPassword and newPassword is the same or not
            // Check if old password matches the password in database
            // If old password is a match, change password

            const currentPasswordInDatabase = await databasePool.query(
              "SELECT password from users WHERE users.user_id = $1;",
              [args.userId]
            );

            if (currentPasswordInDatabase.rows.length == 1) {
              const doesCurrentPasswordsMatch =
                currentPasswordInDatabase.rows[0].password === currentPassword;

              console.log(
                "doesCurrentPasswordMatch: ",
                doesCurrentPasswordsMatch
              );

              if (doesCurrentPasswordsMatch) {
                const changePassword = await databasePool.query(
                  "UPDATE users SET password = $2 WHERE user_id = $1 RETURNING *",
                  [args.userId, args.newPassword]
                );

                console.log("changePassword: ", changePassword);

                if (changePassword.rows.length == 1) {
                  return 200;
                }
              } else {
                console.log("Incorrect current password");
                return 400;
              }
            } else {
              console.log("User does not exist");
              return 400;
            }
          } catch (err) {
            console.log("Error: ", err);
            return 400;
          }
        }
      },
    },
    deleteUser: {
      type: User,
      args: {
        userId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          return (
            await databasePool.query(
              "DELETE FROM users WHERE user_id = $1 RETURNING *",
              [args.userId]
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
              id: userToLogin.userId,
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
    resetPassword: {
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
              [args.userId, password]
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
        userId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await databasePool.query(
              "UPDATE users SET wallet_balance = 10000 WHERE user_id = $1 RETURNING wallet_balance",
              [args.userId]
            )
          ).rows[0].wallet_balance;
        } catch (err) {
          throw new Error("Failed to reset user's balance");
        }
      },
    },
  }),
});

module.exports = Mutation;

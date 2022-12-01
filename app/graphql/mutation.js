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

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createBuyTrade: {
      type: scalarResolvers.Void,
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) },
        synthetic_type: { type: GraphQLNonNull(GraphQLString) },
        trade_result: {
          type: GraphQLNonNull(GraphQLFloat),
        },
        ticks: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          const transaction_type = "buy";
          const trade_result = args.trade_result * -1;

          console.log("user_id: ", args.user_id);
          console.log("trade_result: ", trade_result);
          console.log("syntheticType: ", args.synthetic_type);

          // Calculate current wallet balance
          const user_details = await databasePool.query(
            `SELECT * FROM users WHERE users.user_id = $1;`,
            [args.user_id]
          );

          console.log("user_details", user_details);

          const current_wallet_balance = user_details.rows[0].wallet_balance;

          const res = await databasePool.query(
            "INSERT INTO trades (user_id, synthetic_type, transaction_type, trade_result, current_wallet_balance, ticks) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [
              args.user_id,
              args.synthetic_type,
              transaction_type,
              trade_result,
              current_wallet_balance,
              args.ticks,
            ]
          );

          // If query is successful, return 200 OK
          if (res.rows[0]) {
            // return 200;
            const tradeTime = res.rows[0].trade_time;
            const ticks = res.rows[0].ticks;

            console.log("tradeTime: ", tradeTime);
            console.log("ticks: ", ticks);
            // Close trade after end time is reached
            const sellTradeTime = "";
          }
        } catch (err) {
          console.log("Failed to insert new trade");
        }
      },
    },
    // TODO: changePassword
    changePassword: {
      type: User,
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          return (
            await databasePool.query(
              "UPDATE users SET password = $2 WHERE user_id = $1 RETURNING *",
              [args.user_id, args.password]
            )
          ).rows[0];
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

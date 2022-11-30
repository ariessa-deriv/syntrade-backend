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
const TradeEnum = require("./enum/trade");
const databasePool = require("../lib/database");
const User = require("./object/user");
const Trade = require("./object/trade");
const { isEmailValid, isPasswordValid } = require("../lib/helpers");
const Cookies = require("cookies");

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createTrade: {
      type: Trade,
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) },
        synthetic_type: { type: GraphQLNonNull(SyntheticEnum) },
        trade_type: { type: GraphQLNonNull(TradeEnum) },
        trade_result: {
          type: GraphQLNonNull(GraphQLFloat),
        },
        current_wallet_balance: {
          type: GraphQLNonNull(GraphQLFloat),
        },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          return (
            await databasePool.query(
              "INSERT INTO trades (user_id, synthetic_type, trade_type, trade_result, current_wallet_balance) VALUES ($1, $2, $3, $4, $5) RETURNING *",
              [
                args.user_id,
                args.synthetic_type,
                args.trade_type,
                args.trade_result,
                args.current_wallet_balance,
              ]
            )
          ).rows[0];
        } catch (err) {
          throw new Error("Failed to insert new trade");
        }
      },
    },
    updateUser: {
      type: User,
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) },
        email: { type: GraphQLNonNull(scalarResolvers.EmailAddress) },
        password: { type: GraphQLNonNull(GraphQLString) },
        wallet_balance: { type: GraphQLNonNull(GraphQLFloat) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          return (
            await databasePool.query(
              "UPDATE users SET email = $2, password = $3, wallet_balance = $4 WHERE user_id = $1 RETURNING *",
              [args.user_id, args.email, args.password, args.wallet_balance]
            )
          ).rows[0];
        } catch (err) {
          throw new Error("Failed to insert new user");
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
      type: User,
      args: {
        email: { type: GraphQLNonNull(scalarResolvers.EmailAddress) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        // Find user by email
        // If email exists in database, generate a random password to user
        // Update user's password with newly generated random password
        // Send email to user with link to password reset page (link expires in 10 mins)
        return "TODO: forgotPassword";
      },
    },
  }),
});

module.exports = Mutation;

const dotenv = require("dotenv");
const { resolvers: scalarResolvers } = require("graphql-scalars");
const {
  GraphQLObjectType,
  GraphQLID,
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

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createTrade: {
      type: Trade,
      args: {
        user_id: { type: GraphQLNonNull(GraphQLID) },
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
        user_id: { type: GraphQLNonNull(GraphQLID) },
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
        user_id: { type: GraphQLNonNull(GraphQLID) },
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

          console.log(registeredUser.rowCount);

          if (registeredUser.rowCount > 0) {
            throw new Error("Email is already registered");
          }

          try {
            const user = await databasePool.query(
              `INSERT INTO users (email, password) VALUES ('${normalisedEmail}', '${hashedPassword}') RETURNING *;`
            );
            console.log(user);

            const token = jwt.sign(
              {
                id: user.user_id,
              },
              process.env.JWT_SECRET
            );

            console.log(
              "JWT========================================================"
            );
            console.log(token);

            // TODO: Store JWT as HttpCookie
            // TODO: Return JWT token

            // return user.rows[0];
            return jwt.sign(
              {
                id: user.user_id,
              },
              process.env.JWT_SECRET
            );
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
          const user = await databasePool.query(
            `SELECT * FROM users WHERE email = '${normalisedEmail}'`
          );

          console.log("============");
          console.log("user here");
          console.log(user);

          // if there is no user, throw an authentication error
          if (!user) {
            throw new Error("Error signing in");
          }

          console.log("args.password");
          console.log(args.password);
          console.log("user.rows[0]['password']");
          console.log(user.rows[0]["password"]);

          // if the passwords don't match, throw an authentication error
          const valid = await bcrypt.compare(
            args.password,
            user.rows[0]["password"]
          );
          if (!valid) {
            throw new Error("Incorrect password");
          }

          const token = jwt.sign(
            {
              id: user.user_id,
            },
            process.env.JWT_SECRET
          );

          console.log(
            "JWT========================================================"
          );
          console.log(token);

          // TODO: Store JWT as HttpCookie
          // TODO: Return JWT token

          // create and return the json web token
          return jwt.sign(
            {
              id: user._id,
            },
            process.env.JWT_SECRET
          );
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

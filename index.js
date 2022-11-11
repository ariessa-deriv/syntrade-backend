const express = require("express");
var cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const dotenv = require("dotenv");
const graphql = require("graphql");
const { resolvers: scalarResolvers } = require("graphql-scalars");
const joinMonster = require("join-monster");
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLList,
  GraphQLSchema,
  GraphQLEnumType,
} = graphql;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

dotenv.config();

// Connect to database
const { Client } = require("pg");
const client = new Client({
  host: process.env.HOST,
  user: process.env.POSTGRESQL_USER,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
  port: process.env.PORT,
});
client.connect();

const User = new graphql.GraphQLObjectType({
  name: "User",
  extensions: { joinMonster: { sqlTable: "users", uniqueKey: "user_id" } },
  fields: () => ({
    user_id: { type: graphql.GraphQLString },
    email: { type: scalarResolvers.EmailAddress },
    password: { type: GraphQLString },
    wallet_balance: { type: GraphQLFloat },
    date_joined: { type: scalarResolvers.BigInt },
    trades: {
      type: Trade,
      sqlJoin: (userTable, tradeTable, args) =>
        `${userTable}.user_id = ${tradeTable}.user_id`,
    },
  }),
});

const Trade = new graphql.GraphQLObjectType({
  name: "Trade",
  extensions: { joinMonster: { sqlTable: "trades", uniqueKey: "trade_id" } },
  fields: () => ({
    trade_id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    synthetic_type: { type: SyntheticTypeEnum },
    currency: { type: scalarResolvers.Currency },
    trade_time: { type: scalarResolvers.BigInt },
    trade_type: { type: TradeTypeEnum },
    trade_result: { type: GraphQLFloat },
    current_wallet_balance: { type: GraphQLString },
  }),
});

const SyntheticTypeEnum = new GraphQLEnumType({
  name: "SyntheticTypeEnum",
  values: {
    "Boom 100": {
      value: 1,
    },
    "Boom 300": {
      value: 2,
    },
    "Boom 500": {
      value: 3,
    },
    "Crash 100": {
      value: 4,
    },
    "Crash 300": {
      value: 5,
    },
    "Crash 500": {
      value: 6,
    },
    "Volatility 10": {
      value: 7,
    },
    "Volatility 25": {
      value: 8,
    },
  },
});

const TradeTypeEnum = new graphql.GraphQLEnumType({
  name: "TradeTypeEnum",
  values: {
    buy: {
      value: 1,
    },
    sell: {
      value: 2,
    },
  },
});

const QueryRoot = new graphql.GraphQLObjectType({
  name: "Query",
  fields: () => ({
    me: {
      type: User,
      resolve: (parent, args, context, resolveInfo) => {},
    },
    users: {
      type: new graphql.GraphQLList(User),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
    user: {
      type: User,
      args: { user_id: { type: graphql.GraphQLNonNull(GraphQLID) } },
      where: (userTable, args, context) =>
        `${userTable}.user_id = ${args.user_id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
    trades: {
      type: new graphql.GraphQLList(Trade),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
    trade: {
      type: Trade,
      args: { trade_id: { type: graphql.GraphQLNonNull(GraphQLID) } },
      where: (userTable, args, context) =>
        `${userTable}.trade_id = ${args.trade_id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
  }),
});

const MutationRoot = new graphql.GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createTrade: {
      type: Trade,
      args: {
        user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
        synthetic_type: { type: graphql.GraphQLNonNull(SyntheticTypeEnum) },
        trade_type: { type: graphql.GraphQLNonNull(TradeTypeEnum) },
        trade_result: {
          type: graphql.GraphQLNonNull(graphql.GraphQLFloat),
        },
        current_wallet_balance: {
          type: graphql.GraphQLNonNull(graphql.GraphQLFloat),
        },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          return (
            await client.query(
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
        user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
        email: { type: graphql.GraphQLNonNull(scalarResolvers.EmailAddress) },
        password: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        wallet_balance: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          return (
            await client.query(
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
        user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          // TODO: Get user id from JWT
          return (
            await client.query(
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
        email: { type: graphql.GraphQLNonNull(scalarResolvers.EmailAddress) },
        password: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        // Normalise email address
        const normalisedEmail = args.email.trim().toLowerCase();

        // TODO: Check email validity

        // TODO: Check password validity

        // Hash the password
        const hashedPassword = await bcrypt.hash(args.password, 10);
        // Check if email has been registered or not
        const registeredUser = await client.query(
          `SELECT * FROM users WHERE email = '${normalisedEmail}' `
        );

        console.log(registeredUser.rowCount);

        if (registeredUser.rowCount > 0) {
          throw new Error("Email is already registered");
        }

        try {
          const user = await client.query(
            `INSERT INTO users (email, password) VALUES ('${normalisedEmail}', '${hashedPassword}') RETURNING *`
          );
          console.log(user);

          const token = jwt.sign(
            {
              id: user.user_id,
            },
            process.env.JWT_SECRET
          );

          console.log(
            "========================================================"
          );
          console.log(token);

          // Create and return the json web token
          // return user.rows[0];
          return jwt.sign(
            {
              id: user.user_id,
            },
            process.env.JWT_SECRET
          );
        } catch (err) {
          console.log(err);
          throw new Error("Error creating account");
        }
      },
    },
    login: {
      type: User,
      args: {
        email: { type: graphql.GraphQLNonNull(scalarResolvers.EmailAddress) },
        password: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        // Normalise email address
        const normalisedEmail = args.email.trim().toLowerCase();

        // Find user by email address
        const user = await client.query(
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
        // create and return the json web token
        return jwt.sign(
          {
            id: user._id,
          },
          process.env.JWT_SECRET
        );
      },
    },
    forgotPassword: {
      type: User,
      args: {
        email: { type: graphql.GraphQLNonNull(scalarResolvers.EmailAddress) },
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

const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
  mutation: MutationRoot,
});

var app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(
  "/",
  // bodyParser.json(),
  graphqlHTTP(async (req, res, graphQLParams) => ({
    schema: schema,
    graphiql: true,
    // context: {
    //   SECRET,
    //   SECRET_2,
    //   user: req.user,
    //   res,
    // },
  }))
);

app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000");

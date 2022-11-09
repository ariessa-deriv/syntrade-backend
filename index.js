const express = require("express");
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
} = graphql;
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
    email: { type: GraphQLString },
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

User._typeConfig = {
  sqlTable: "users",
  uniqueKey: "user_id",
};

const Trade = new graphql.GraphQLObjectType({
  name: "Trade",
  extensions: { joinMonster: { sqlTable: "trades", uniqueKey: "trade_id" } },
  fields: () => ({
    trade_id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    type: { type: graphql.GraphQLInt },
    currency: { type: GraphQLString },
    trade_time: { type: scalarResolvers.BigInt },
    trade_type: { type: GraphQLString },
    is_debit: { type: GraphQLBoolean },
    current_wallet_balance: { type: GraphQLFloat },
  }),
});

Trade._typeConfig = {
  sqlTable: "trades",
  uniqueKey: "trade_id",
};

const QueryRoot = new graphql.GraphQLObjectType({
  name: "Query",
  fields: () => ({
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
    createUser: {
      type: User,
      args: {
        email: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        password: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await client.query(
              "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
              [args.email, args.password]
            )
          ).rows[0];
        } catch (err) {
          throw new Error("Failed to insert new user");
        }
      },
    },
    createTrade: {
      type: Trade,
      args: {
        user_id: { type: graphql.GraphQLNonNull(graphql.GraphQLID) },
        type: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
        trade_type: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        is_debit: {
          type: graphql.GraphQLNonNull(graphql.GraphQLBoolean),
        },
        current_wallet_balance: {
          type: graphql.GraphQLNonNull(graphql.GraphQLFloat),
        },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await client.query(
              "INSERT INTO trades (user_id, type, trade_type, is_debit, current_wallet_balance) VALUES ($1, $2, $3, $4, $5) RETURNING *",
              [
                args.user_id,
                args.type,
                args.trade_type,
                args.is_debit,
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
        email: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        password: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        wallet_balance: { type: graphql.GraphQLNonNull(graphql.GraphQLFloat) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
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
  }),
});

const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
  mutation: MutationRoot,
});

var app = express();
app.use(
  "/",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000");

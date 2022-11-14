const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");
const joinMonster = require("join-monster");
const User = require("./object/user");
const Trade = require("./object/trade");
const databasePool = require("../lib/database");

const query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    // TODO: me
    me: {
      type: User,
      resolve: (parent, args, context, resolveInfo) => {},
    },
    users: {
      type: new GraphQLList(User),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, async (sql) => {
          return await databasePool.query(sql);
        });
      },
    },
    user: {
      type: User,
      args: { user_id: { type: GraphQLNonNull(GraphQLID) } },
      where: (userTable, args, context) =>
        `${userTable}.user_id = ${args.user_id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, async (sql) => {
          return await databasePool.query(sql);
        });
      },
    },
    trades: {
      type: new GraphQLList(Trade),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return databasePool.query(sql);
        });
      },
    },
    trade: {
      type: Trade,
      args: { trade_id: { type: GraphQLNonNull(GraphQLID) } },
      where: (userTable, args, context) =>
        `${userTable}.trade_id = ${args.trade_id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, async (sql) => {
          return await databasePool.query(sql);
        });
      },
    },
  }),
});

module.exports = query;

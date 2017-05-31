import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import { MongoClient } from 'mongodb';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import OpticsAgent from 'optics-agent';
import { parse } from 'url';

import Logger from './logger';
import loadModelsWithContext from '../model';
import typeDefs from '../schema';
import resolvers from '../resolvers';
import { pubsub } from './subscriptions';
import authenticate from './authenticate';

import Skeletor from '../lib/skeletor';
const skeletor = new Skeletor({ typeDefs, resolvers });
const schema = skeletor.getExecutableSchema();

const {
  ROOT_URL = 'http://localhost:3000',
  PORT = 3000,
  MONGO_PORT = parseInt(PORT, 10) + 1,
  MONGO_DATABASE = 'api',
  MONGO_URL = `mongodb://localhost:${MONGO_PORT}/${MONGO_DATABASE}`
} = process.env;

const defaultGraphiQLQuery = `
{
  users {
    _id
    email
    createdAt
  }
}
`;

export default async function startServer() {
  const db = await MongoClient.connect(MONGO_URL);

  const app = express().use('*', cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    req.context = loadModelsWithContext({ db, pubsub });
    next();
  });

  if (process.env.OPTICS_API_KEY) {
    OpticsAgent.instrumentSchema(schema);
    app.use(OpticsAgent.middleware());
  }

  authenticate(app);

  app.use('/graphql', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      // if (!user) {
      //   res.status(403);
      //   res.json({ error: 'Not authorized' });
      //   return Logger.error('Not authorized');
      // }
      graphqlExpress(() => {
        // Get the query, the same way express-graphql does it
        // https://github.com/graphql/express-graphql/blob/3fa6e68582d6d933d37fa9e841da5d2aa39261cd/src/index.js#L257
        const query = req.query.query || req.body.query;

        if (query && query.length > 2000) {
          // None the app's queries should be this long
          // Probably indicates someone trying to send an overly expensive query
          throw new Error('Query too large.');
        }

        const context = Object.assign({
          user,
          userId: user && user._id,
          opticsContext: process.env.OPTICS_API_KEY && OpticsAgent.context(req)
        }, req.context);

        return {
          schema,
          context,
          debug: process.env.NODE_ENV !== 'production',
          formatError: (e) => ({
            message: e.message,
            locations: e.locations,
            path: e.path
          })
        };
      })(req, res, next);
    })(req, res, next);
  });

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://${parse(ROOT_URL).hostname}:${PORT}/subscriptions`,
    query: defaultGraphiQLQuery
  }));

  // WebSocket server for subscriptions
  const server = createServer(app);

  server.listen(PORT, () => {
    new SubscriptionServer.create({
      schema,
      execute,
      subscribe,

      // the onOperation function is called for every new operation
      // and we use it to set the GraphQL context for this operation
      onOperation: (msg, params, socket) => {
        return new Promise((resolve) => {
          if (socket.upgradeReq) {
            const paramsWithBaseContext = Object.assign({}, params, {
              context: {
                opticsContext: process.env.OPTICS_API_KEY && OpticsAgent.context(socket.upgradeReq)
              }
            });
            return resolve(paramsWithBaseContext);
          }
        });
      }
    }, {
      server,
      path: '/subscriptions'
    });

    Logger.info(`API Server is now running on ${ROOT_URL}`);
    Logger.info(`Websocket server is now running on ws://${parse(ROOT_URL).hostname}`);
  });
}

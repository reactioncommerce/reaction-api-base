import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from 'graphql-tools';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import passport from 'passport';
import Logger from './logger';

import typeDefs from '../schema';
import resolvers from '../resolvers';
import addModelsToContext from '../model';
import authenticate from './authenticate';

import { pubsub, subscriptionManager } from './subscriptions';

const schema = makeExecutableSchema({ typeDefs, resolvers });

const {
  PORT = 3000,
  WS_PORT = parseInt(PORT, 10) + 1,
  MONGO_PORT = parseInt(PORT, 10) + 2,
  MONGO_DATABASE = 'api',
  MONGO_URL = `mongodb://localhost:${MONGO_PORT}/${MONGO_DATABASE}`
} = process.env;


export default async function startServer() {
  const db = await MongoClient.connect(MONGO_URL);

  const app = express().use('*', cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    req.context = addModelsToContext({ db, pubsub });
    next();
  });

  authenticate(app);

  app.use('/graphql', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      graphqlExpress(() => {
        // Get the query, the same way express-graphql does it
        // https://github.com/graphql/express-graphql/blob/3fa6e68582d6d933d37fa9e841da5d2aa39261cd/src/index.js#L257
        const query = req.query.query || req.body.query;

        if (query && query.length > 2000) {
          // None the app's queries should be this long
          // Probably indicates someone trying to send an overly expensive query
          throw new Error('Query too large.');
        }

        return {
          schema,
          context: Object.assign({ user }, req.context),
          debug: process.env.NODE_ENV !== 'production',
          formatError(e) { Logger.error(e); }
        };
      })(req, res, next);
    })(req, res, next);
  });

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
  }));

  app.listen(PORT, () => Logger.info(
    `API Server is now running on http://localhost:${PORT}`
  ));

  // WebSocket server for subscriptions
  const websocketServer = createServer((request, response) => {
    response.writeHead(404);
    response.end();
  });

  websocketServer.listen(WS_PORT, () => Logger.info(
    `Websocket server is now running on http://localhost:${WS_PORT}`
  ));

  new SubscriptionServer({
    subscriptionManager,
    // the onSubscribe function is called for every new subscription
    // and we use it to set the GraphQL context for this subscription
    onSubscribe(msg, params) {
      return Object.assign({}, params, { context: Object.assign({}, context) });
    }
  }, {
    server: websocketServer,
    path: '/'
  });
}

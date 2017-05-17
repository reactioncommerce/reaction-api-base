import fs from 'fs';
import path from 'path';
import startServer from './server';
import Logger from './server/logger';

// set the development database location
const dbpath = path.join('../', 'db');

// get the db/app configs from the env
const {
  PORT = 3000,
  MONGO_PORT = parseInt(PORT, 10) + 2,
  MONGO_DATABASE = 'api',
  MONGO_URL
} = process.env;

function startApp() {
  startServer()
    .then(() => Logger.info('Starting API server...'))
    .catch((e) => Logger.error(e, 'Server startup error'));
}

// start a local development database if no MONGO_URL provided
if (!MONGO_URL) {
  // an external database is required in production
  if (process.env.NODE_ENV === 'production') {
    Logger.error('A MONGO_URL must be provided in production');
    process.exit(1);
  }

  if (!fs.existsSync(dbpath)) {
    fs.mkdirSync(dbpath);
  }

  const Mongod = require('mongodb-prebuilt').MongodHelper;

  const mongod = new Mongod([
    '--port', MONGO_PORT,
    '--dbpath', dbpath
  ]);

  mongod.run().then(() => {
  	Logger.info(`Mongod is now running at mongodb://localhost:${MONGO_PORT}/${MONGO_DATABASE}`);
    startApp();
  }, (e) => {
    if (e === 'already running') {
      startApp();
    } else {
      Logger.error(`Failed to start MongoDB server on port ${MONGO_PORT}. ${e}`);
      process.exit(1);
    }
  });
} else {
  startApp();
}

// Ensure stopping our parent process will properly kill nodemon's process
// https://www.exratione.com/2013/05/die-child-process-die/

// SIGTERM AND SIGINT will trigger the exit event.
process.once('SIGTERM', function () {
  process.exit(0);
});
process.once('SIGINT', function () {
  process.exit(0);
});
// And the exit event shuts down the child.
process.once('exit', function () {
  if (process.env.NODE_ENV !== 'production') {
    const nodemon = require('nodemon');
    nodemon.emit('SIGINT');
  }
});

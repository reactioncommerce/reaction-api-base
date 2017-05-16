import fs from 'fs';
import path from 'path';
import nodemon from 'nodemon';
import mongoPrebuilt from 'mongodb-prebuilt';
import denodeify from 'denodeify';
import startServer from './server';
import Logger from './server/logger';
import MONGO_CODES from './utils/mongo-codes';

// set the development database location
const dbpath = path.join('../', 'db');

const {
  PORT = 3000,
  MONGO_PORT = parseInt(PORT, 10) + 2,
  MONGO_URL
} = process.env;

if (!MONGO_URL) {
  if (!fs.existsSync(dbpath)) {
    fs.mkdirSync(dbpath);
  }

  // This promise never resolves if Mongo starts.
  // However, we'll just go ahead and start the node server anyway,
  // and if we see an error, we'll quit
  denodeify(mongoPrebuilt.start_server.bind(mongoPrebuilt))({
    auto_shutdown: true,
    args: {
      port: MONGO_PORT,
      dbpath
    }
  })
  .catch((errorCode) => {
    const error = MONGO_CODES[errorCode];
    Logger.error(`Failed to start MongoDB server on port ${MONGO_PORT}`);
    Logger.error(`Error Code ${errorCode}: ${error ? error.longText : 'Unknown'}`);
    process.exit(1);
  });
}

// kick off the server
startServer()
  .then(() => Logger.info('All systems go!'))
  .catch((e) => Logger.error(e, 'Server startup error'));

// Ensure stopping our parent process will properly kill nodemon's process
// Ala https://www.exratione.com/2013/05/die-child-process-die/

// SIGTERM AND SIGINT will trigger the exit event.
process.once('SIGTERM', function () {
  process.exit(0);
});
process.once('SIGINT', function () {
  process.exit(0);
});
// And the exit event shuts down the child.
process.once('exit', function () {
  nodemon.emit('SIGINT');
});

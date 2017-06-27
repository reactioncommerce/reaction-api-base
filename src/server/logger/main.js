import _ from 'lodash';
import bunyan from 'bunyan';
import bunyanFormat from 'bunyan-format';
import Bunyan2Loggly from './loggly';

/**
 * Global logging config
 */

const levels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

let level = process.env.LOG_LEVEL || 'INFO';

level = level.toUpperCase();

if (!_.includes(levels, level)) {
  level = 'INFO';
}

// default console config (stdout)
const streams = [{
  level,
  stream: bunyanFormat({ outputMode: 'short' })
}];


// Loggly config (service only used if configured)
const logglyToken = process.env.LOGGLY_TOKEN;
const logglySubdomain = process.env.LOGGLY_SUBDOMAIN;

if (logglyToken && logglySubdomain) {
  const logglyStream = {
    type: 'raw',
    level: process.env.LOGGLY_LOG_LEVEL || 'DEBUG',
    stream: new Bunyan2Loggly({
      token: logglyToken,
      subdomain: logglySubdomain
    }, process.env.LOGGLY_BUFFER_LENGTH || 1)
  };
  streams.push(logglyStream);
}


// create default logger instance
const Logger = bunyan.createLogger({
  name: process.env.APP_NAME || 'API',
  streams
});

export default Logger;
